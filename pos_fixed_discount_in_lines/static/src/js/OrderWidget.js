odoo.define("pos_fixed_discount_in_lines.PosOrderWidgetMod", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;
    var OrderWidget = require("point_of_sale.OrderWidget");

    const PosOrderWidgetMod = (OrderWidget) =>
        class extends OrderWidget {
            constructor() {
                super(...arguments);
                this.state = useState({
                    total: 0,
                    tax: 0,
                    fixed_discount: 0,
                    subtotal: 0,
                });
                this._updateSummary();
            }

            _updateSummary() {
                super._updateSummary(...arguments);
                // Const fixed_discount = this.order ? this.order.get_fixed_discount() : 0;
                // this.state.fixed_discount = this.env.pos.format_currency(
                //     fixed_discount
                // );
                // this.state.subtotal = this.env.pos.format_currency(
                //     this.order.get_total_without_tax() + fixed_discount
                // );
                // this.render();
            }
        };
    Registries.Component.extend(OrderWidget, PosOrderWidgetMod);
    return OrderWidget;
});
