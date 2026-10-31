// Copyright 2026 INVITU (https://www.invitu.com)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    get hasKitchenPrinter() {
        return this.unwatched.printers.length > 0;
    },
    canReprintKitchenReceipt(order) {
        const lines = order?.last_order_preparation_change?.lines || {};
        return this.hasKitchenPrinter && Object.keys(lines).length > 0;
    },
    getKitchenReprintSourceLines(order) {
        if (order.finalized) {
            // A paid order no longer changes, and outside restaurant mode its
            // last_order_preparation_change is not synced when printing fails.
            return order.lines
                .filter((line) => line.product_id && line.get_quantity() > 0)
                .map((line) => ({
                    uuid: line.uuid,
                    name: line.get_full_product_name(),
                    basic_name: line.product_id.name,
                    display_name: line.product_id.display_name,
                    isCombo: line.combo_item_id?.id,
                    product_id: line.product_id.id,
                    attribute_value_ids: line.attribute_value_ids,
                    quantity: line.get_quantity(),
                    note: line.getNote(),
                }));
        }
        // Only what was already sent to the kitchen: lines not sent yet stay
        // pending for the next "Order".
        return Object.values(order.last_order_preparation_change.lines)
            .filter((line) => line.quantity > 0)
            .map((line) => ({...line}));
    },
    getKitchenReprintLines(order) {
        // Sorted like printChanges.
        const getProduct = (line) =>
            this.models["product.product"].get(line.product_id);
        const isPartOfCombo = (line) =>
            line.isCombo || getProduct(line).type === "combo";
        const lines = this.getKitchenReprintSourceLines(order);
        for (const line of lines) {
            const categ = getProduct(line).pos_categ_ids[0];
            line.pos_categ_id = categ?.id ?? 0;
            line.pos_categ_sequence = categ?.sequence ?? 0;
        }
        const normalLines = lines.filter((line) => !isPartOfCombo(line));
        normalLines.sort((a, b) => {
            if (a.pos_categ_sequence === 0 && b.pos_categ_sequence === 0) {
                return a.pos_categ_id - b.pos_categ_id;
            }
            return a.pos_categ_sequence - b.pos_categ_sequence;
        });
        return [...lines.filter(isPartOfCombo), ...normalLines];
    },
    async reprintKitchenReceipt(order) {
        const lines = this.getKitchenReprintLines(order);
        const failedPrinters = [];
        for (const printer of this.unwatched.printers) {
            const changes = this._getPrintingCategoriesChanges(
                printer.config.product_categories_ids,
                {new: lines, cancelled: [], noteUpdated: []}
            );
            if (!changes.new.length) {
                continue;
            }
            // Untranslated like the other kitchen receipt titles of the core.
            const printed = await this.printReceipts(
                order,
                printer,
                "Reprinted",
                changes.new,
                true
            );
            if (!printed) {
                failedPrinters.push(printer.config.name);
            }
        }
        if (failedPrinters.length) {
            this.dialog.add(AlertDialog, {
                title: _t("Printing failed"),
                body: _t(
                    "Failed in reprinting the kitchen receipt on: %s",
                    failedPrinters.join(", ")
                ),
            });
        }
    },
});
