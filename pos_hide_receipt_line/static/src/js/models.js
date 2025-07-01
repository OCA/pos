odoo.define("pos_hide_receipt_line.models", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const {Orderline} = require("point_of_sale.models");

    const PosHideReceiptLineOrderline = (Orderline) =>
        class extends Orderline {
            get hideReceiptLine() {
                return (
                    this.product.pos_hide_receipt_line && this.get_display_price() === 0
                );
            }

            export_for_printing() {
                const result = super.export_for_printing();
                result.hideReceiptLine = this.hideReceiptLine;
                return result;
            }
        };

    Registries.Model.extend(Orderline, PosHideReceiptLineOrderline);
});
