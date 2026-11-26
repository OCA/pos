/* Copyright 2024 Hunki Enterprises BV
 * Copyright 2026 Trobz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async addLineToOrder(vals, order, opts = {}, configure = true) {
        const line = await super.addLineToOrder(vals, order, opts, configure);
        if (!line || line.is_container_deposit) {
            return line;
        }
        const product = line.product_id;
        if (!product || product.is_deposit) {
            return line;
        }
        if (!product.deposit_product_id) {
            if (product.raw?.deposit_product_id) {
                this.dialog.add(AlertDialog, {
                    title: _t("Deposit not available"),
                    body: _t(
                        "%s is configured with a container deposit, but the deposit product is not available in this Point of Sale. Check that it is active, available in this Point of Sale, and in one of the allowed categories.",
                        product.display_name
                    ),
                });
            }
            return line;
        }
        let depositLine = line.container_deposit_line_id;
        if (!depositLine) {
            depositLine = await super.addLineToOrder(
                {product_id: product.deposit_product_id, qty: line.qty},
                order,
                {},
                false
            );
            if (depositLine) {
                depositLine.update({is_container_deposit: true});
                line.update({container_deposit_line_id: depositLine});
            }
        } else if (depositLine.qty !== line.qty) {
            depositLine.set_quantity(line.qty);
        }
        if (depositLine) {
            this.selectOrderLine(order, line);
        }
        return line;
    },
});
