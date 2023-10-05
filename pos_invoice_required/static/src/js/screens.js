odoo.define("pos_invoice_required.screens", function(require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var core = require("web.core");
    var _t = core._t;

    screens.PaymentScreenWidget.include({
        validate_order: function(options) {
            var order = this.pos.get_order();
            if (
                this.pos.config.require_invoice === "required" &&
                order.to_invoice === false
            ) {
                this.gui.show_popup("error", {
                    title: _t("Invoice Required"),
                    body: _t("Please select invoice for this order."),
                });
                return;
            }
            if (this.pos.config.require_invoice === "no" && order.to_invoice === true) {
                this.gui.show_popup("error", {
                    title: _t("Invoice Not Required"),
                    body: _t("Please do not select invoice for this order."),
                });
                return;
            }
            return this._super(options);
        },
    });
});
