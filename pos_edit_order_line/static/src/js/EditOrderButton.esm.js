/** @odoo-module */

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {Component} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {useService} from "@web/core/utils/hooks";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {EditOrderPopup} from "./EditOrderPopup.esm";

export class EditOrderButton extends Component {
    static template = "pos_edit_order_line.EditOrderButton";
    setup() {
        this.pos = usePos();
        this.popup = useService("popup");
    }
    async onClick() {
        var self = this;
        var order = this.pos.get_order();
        var order_lines = order.get_orderlines();
        if (!order_lines.length) {
            return this.popup.add(ErrorPopup, {
                title: _t("Empty Order"),
                body: _t("You need add some products first"),
            });
        }
        var array = [];
        order_lines.forEach((line) => {
            array.push({
                id: line.id,
                discount: line.discount,
                price: line.get_unit_price(),
                quantity: line.quantity,
                uom: self.pos.units_by_id[line.product.uom_id[0]].name,
                name: line.get_full_product_name(),
            });
        });
        const {confirmed, payload} = await this.popup.add(EditOrderPopup, {
            title: _t("Edit Order Line"),
            array: array,
        });
        if (confirmed) {
            await self.apply_changes(payload);
        }
    }
    async apply_changes(payload) {
        var order = this.pos.get_order();
        Object.entries(payload).forEach(([id, changes]) => {
            var line = order.get_orderline(parseInt(id, 10));
            Object.entries(changes).forEach(([key, value]) => {
                if (key === "quantity") {
                    line.set_quantity(value);
                } else if (key === "price") {
                    line.set_unit_price(value);
                } else if (key === "discount") {
                    line.set_discount(value);
                }
            });
        });
    }
}

ProductScreen.addControlButton({
    component: EditOrderButton,
    condition: function () {
        return this.pos.config.allow_edit_order_line;
    },
});
