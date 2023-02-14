odoo.define("pos_edit_order_line.EditOrderButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");

    class EditOrderButton extends PosComponent {
        async onClick() {
            var self = this;
            var order = this.env.pos.get_order();
            var order_lines = order.get_orderlines();
            if (!order_lines.length) {
                return this.showPopup("ErrorPopup", {
                    title: _t("Empty Order"),
                    body: _t("You need add some products first"),
                });
            }
            var array = [];
            _.each(order_lines, function (line) {
                array.push({
                    id: line.id,
                    discount: line.discount,
                    price: line.get_unit_price(),
                    quantity: line.quantity,
                    uom: self.env.pos.units_by_id[line.product.uom_id[0]].name,
                    name: line.get_full_product_name(),
                });
            });
            const {confirmed, payload} = await this.showPopup("EditOrderPopup", {
                title: this.env._t("Edit Order Line"),
                array: array,
            });
            if (confirmed) {
                await self.apply_changes(payload);
            }
        }
        async apply_changes(payload) {
            var order = this.env.pos.get_order();
            _.each(payload, function (changes, id) {
                var line = order.get_orderline(parseInt(id, 10));
                _.each(changes, function (value, key) {
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
    EditOrderButton.template = "EditOrderButton";

    ProductScreen.addControlButton({
        component: EditOrderButton,
        condition: function () {
            return this.env.pos.config.allow_edit_order_line;
        },
    });

    Registries.Component.add(EditOrderButton);

    return EditOrderButton;
});
