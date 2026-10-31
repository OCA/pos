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
    getKitchenReprintLines(order) {
        // Same keys as the lines computed by getOrderChanges for OrderChangeReceipt.
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
            const printed = await this.printReceipts(
                order,
                printer,
                _t("Reprinted"),
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
