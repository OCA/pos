/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {ProductConfiguratorPopup} from "@point_of_sale/app/store/product_configurator_popup/product_configurator_popup";
import {_t} from "@web/core/l10n/translation";
import {makeAwaitable} from "@point_of_sale/app/store/make_awaitable_dialog";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    /**
     * Reopen the variant configurator on an existing line and apply the newly
     * picked variant, in place when possible.
     *
     * @param {import("@point_of_sale/app/models/pos_order_line").PosOrderline} line
     */
    async changeOrderlineVariant(line) {
        const product = line.product_id;

        if (!product.isConfigurable()) {
            return;
        }

        if (line.pack_lot_ids.length > 0) {
            this.dialog.add(AlertDialog, {
                title: _t("Cannot change variant"),
                body: _t(
                    "This line already has lot/serial numbers assigned. Remove them before changing the variant."
                ),
            });
            return;
        }

        const payload = await makeAwaitable(this.dialog, ProductConfiguratorPopup, {
            product,
            defaultValues: this.getOrderlineVariantDefaultValues(line, product),
        });

        if (!payload) {
            return;
        }

        const productFound = this.resolveConfiguredVariant(payload);
        if (!productFound) {
            return;
        }

        const order = line.order_id;
        // Split off the confirmed unit here, after confirmation, so cancelling
        // the popup never leaves a stray split behind.
        const targetLine =
            line.get_quantity() > 1 ? this.splitOrderlineUnit(line, order) : line;
        const attributeCommands = this.buildOrderlineAttributeCommands(payload);

        if (targetLine.uuid in order.last_order_preparation_change.lines) {
            this.replaceOrderlineVariant(
                targetLine,
                productFound,
                payload,
                attributeCommands,
                order
            );
        } else {
            this.updateOrderlineVariant(
                targetLine,
                productFound,
                payload,
                attributeCommands,
                order
            );
        }
    },

    /**
     * "always" attributes are encoded by the chosen product itself, not on the
     * line; "no_variant"/custom attributes are the other way around. Merge both
     * sources so every attribute line gets pre-filled with the line's current
     * selection. Multi-select values go under their own sub-key since a single
     * string can't represent several values selected at once (see the
     * MultiProductAttribute patch in this module).
     */
    getOrderlineVariantDefaultValues(line, product) {
        const defaultValues = {multi: {}};
        for (const value of product.product_template_variant_value_ids) {
            defaultValues[value.attribute_line_id.id] = value.id.toString();
        }
        for (const value of line.attribute_value_ids) {
            const lineId = value.attribute_line_id.id;
            if (value.attribute_id.display_type === "multi") {
                defaultValues.multi[lineId] = defaultValues.multi[lineId] || [];
                defaultValues.multi[lineId].push(value.id.toString());
            } else {
                defaultValues[lineId] = value.id.toString();
            }
        }
        return defaultValues;
    },

    /** Same variant resolution as PosStore.addLineToOrder. */
    resolveConfiguredVariant(payload) {
        return this.models["product.product"]
            .filter((p) => p.raw?.product_template_variant_value_ids?.length > 0)
            .find((p) =>
                p.raw.product_template_variant_value_ids.every((v) =>
                    payload.attribute_value_ids.includes(v)
                )
            );
    },

    /** Split 1 unit off `line` onto a new sibling line, still on the same variant. */
    splitOrderlineUnit(line, order) {
        const splitLine = this.data.models["pos.order.line"].create({
            order_id: order,
            product_id: line.product_id,
            qty: 1,
            discount: line.get_discount(),
            note: line.getNote(),
            customer_note: line.get_customer_note(),
            notice: line.notice,
            attribute_value_ids: [["link", ...line.attribute_value_ids]],
            custom_attribute_value_ids: line.custom_attribute_value_ids.map((value) => [
                "create",
                {
                    custom_product_template_attribute_value_id:
                        value.custom_product_template_attribute_value_id,
                    custom_value: value.custom_value,
                },
            ]),
        });
        line.set_quantity(line.get_quantity() - 1, true);
        return splitLine;
    },

    /** Attribute/custom-value link commands for the variant just confirmed. */
    buildOrderlineAttributeCommands(payload) {
        const attributeValueCommands = payload.attribute_value_ids
            .filter((id) => {
                const value =
                    this.data.models["product.template.attribute.value"].get(id);
                return (
                    value.is_custom ||
                    value.attribute_id.create_variant === "no_variant"
                );
            })
            .map((id) => [
                "link",
                this.data.models["product.template.attribute.value"].get(id),
            ]);

        const customValueCommands = Object.entries(payload.attribute_custom_values).map(
            ([id, customValue]) => [
                "create",
                {
                    custom_product_template_attribute_value_id:
                        this.data.models["product.template.attribute.value"].get(id),
                    custom_value: customValue,
                },
            ]
        );

        return {attributeValueCommands, customValueCommands};
    },

    /** Line was never sent to the kitchen: update it in place. */
    updateOrderlineVariant(
        line,
        productFound,
        payload,
        {attributeValueCommands, customValueCommands},
        order
    ) {
        line.update({
            product_id: productFound,
            attribute_value_ids: [
                ["unlink", ...line.attribute_value_ids],
                ...attributeValueCommands,
            ],
            custom_attribute_value_ids: [
                ["unlink", ...line.custom_attribute_value_ids],
                ...customValueCommands,
            ],
        });
        this.finalizeOrderlineVariant(line, productFound, payload, order);
    },

    /**
     * Line was already sent to the kitchen: the standard change-detection only
     * notices a quantity delta on a stable uuid, never a product change.
     * Deleting the line makes it correctly picked up as cancelled (using the
     * historic data kept in order.last_order_preparation_change), and adding a
     * fresh line makes the new variant correctly picked up as an addition -
     * the same standard mechanism a cashier removing and re-adding a line
     * would trigger.
     */
    replaceOrderlineVariant(
        line,
        productFound,
        payload,
        {attributeValueCommands, customValueCommands},
        order
    ) {
        const preserved = {
            discount: line.get_discount(),
            note: line.getNote(),
            customer_note: line.get_customer_note(),
            notice: line.notice,
        };
        line.delete();

        const newLine = this.data.models["pos.order.line"].create({
            order_id: order,
            product_id: productFound,
            qty: 1,
            attribute_value_ids: attributeValueCommands,
            custom_attribute_value_ids: customValueCommands,
            ...preserved,
        });
        this.finalizeOrderlineVariant(newLine, productFound, payload, order);
    },

    /** Price, name, dirty flag and selection, common to both outcomes above. */
    finalizeOrderlineVariant(line, productFound, payload, order) {
        line.price_extra = payload.price_extra;
        line.set_unit_price(
            productFound.get_price(
                order.pricelist_id,
                line.get_quantity(),
                line.get_price_extra()
            )
        );
        line.set_full_product_name();
        line.setDirty();
        this.selectOrderLine(order, line);
    },
});
