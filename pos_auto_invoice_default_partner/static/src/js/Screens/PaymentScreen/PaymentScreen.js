odoo.define("pos_auto_invoice_default_partner.PaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    // eslint-disable-next-line no-shadow
    const InvoiceDefaultPartnerPaymentScreen = (PaymentScreen) =>
        // eslint-disable-next-line no-shadow
        class InvoiceDefaultPartnerPaymentScreen extends PaymentScreen {
            async validateOrder() {
                const partner = this.currentOrder.get_partner();
                const default_partner_id = this.env.pos.config.default_partner_id;
                if (
                    this.currentOrder.is_to_invoice() &&
                    !partner &&
                    default_partner_id
                ) {
                    this.currentOrder.set_partner(
                        this.env.pos.db.get_partner_by_id(default_partner_id[0])
                    );
                }
                return super.validateOrder(...arguments);
            }
        };

    Registries.Component.extend(PaymentScreen, InvoiceDefaultPartnerPaymentScreen);
});
