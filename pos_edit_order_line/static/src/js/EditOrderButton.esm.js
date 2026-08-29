/** @odoo-module **/
import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {makeAwaitable} from "@point_of_sale/app/store/make_awaitable_dialog";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {EditOrderPopup} from "./EditOrderPopup.esm";

patch(ControlButtons.prototype, {
    async onClickEditOrder() {
        const order_lines = this.pos.get_order().get_orderlines();
        if (order_lines?.length) {
            var array = [];
            order_lines.forEach((line) => {
                array.push({
                    id: line.id,
                    discount: line.discount || false,
                    price: line.get_unit_price(),
                    quantity: line.qty,
                    uom: line.product_id.uom_id.name,
                    name: line.get_full_product_name(),
                });
            });
            await makeAwaitable(this.dialog, EditOrderPopup, {
                array: array,
            });
        } else {
            this.dialog.add(AlertDialog, {
                title: _t("Empty Order"),
                body: _t("You need add some products first."),
            });
        }
    },
});
