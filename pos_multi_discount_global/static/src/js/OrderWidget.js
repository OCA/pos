odoo.define("pos_multi_discount_global.PosOrderWidgetMod", function (require) {
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
                    percent_discount: 0,
                    subtotal: 0,
                });
                this._updateSummary();
            }

            _updateSummary() {
                super._updateSummary(...arguments);
            }
        };
    Registries.Component.extend(OrderWidget, PosOrderWidgetMod);
    return OrderWidget;
});
