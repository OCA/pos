/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");
    const core = require("web.core");
    const _t = core._t;

    const PosAskCustomerPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            async _isOrderValid(isForceValidate) {
                var order = this.env.pos.get_order();
                if (!order.get_client() && !order.is_pos_crm_checked) {
                    const result = await this.showPopup("TextInputPopup", {
                        title: _t("Customer code or Tax ID?"),
                    });
                    order.set_is_pos_crm_checked(true);
                    if (result.confirmed && result.payload) {
                        this._silentBarcodeVatClientAction(result.payload);
                    }
                }
                return super._isOrderValid(isForceValidate);
            }
            _silentBarcodeVatClientAction(code) {
                const partner = this.env.pos.db.get_partner_by_barcode(code);
                if (partner) {
                    if (this.currentOrder.get_client() !== partner) {
                        this.currentOrder.set_client(partner);
                        this.currentOrder.set_pricelist(
                            _.findWhere(this.env.pos.pricelists, {
                                id: partner.property_product_pricelist[0],
                            }) || this.env.pos.default_pricelist
                        );
                    }
                    return true;
                }
                console.log("Check VAT number");

                return false;
            }
        };

    Registries.Component.extend(PaymentScreen, PosAskCustomerPaymentScreen);

    return PosAskCustomerPaymentScreen;
});
