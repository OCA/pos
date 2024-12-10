/** @odoo-module **/

import PaymentScreen from "point_of_sale.PaymentScreen";
import Registries from "point_of_sale.Registries";

const InvoiceDefaultPartnerPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        async validateOrder() {
            const partner = this.currentOrder.get_partner();
            const default_partner_id = this.env.pos.config.default_partner_id;
            if (this.currentOrder.is_to_invoice() && !partner && default_partner_id) {
                this.currentOrder.set_partner(
                    this.env.pos.db.get_partner_by_id(default_partner_id[0])
                );
            }
            return super.validateOrder(...arguments);
        }
    };

Registries.Component.extend(PaymentScreen, InvoiceDefaultPartnerPaymentScreen);
