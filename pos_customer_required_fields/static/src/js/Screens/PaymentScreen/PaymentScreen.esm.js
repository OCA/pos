/** @odoo-module **/
/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Pierre Verkest <pierreverkest84@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

import PaymentScreen from "point_of_sale.PaymentScreen";
import Registries from "point_of_sale.Registries";

const RequiredFieldsPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        missingPartnerFields() {
            const partner = this.currentOrder.get_partner();
            const requiredFieldsNames =
                this.env.pos.config.res_partner_required_fields_names;
            if (!partner || requiredFieldsNames === "") {
                // In case customer is not required there are no missing fields
                // there are some other check that ensure if customer is
                // required or not, it's not the intent of this method to decide
                return [];
            }
            return requiredFieldsNames.split(",").filter((name) => !partner[name]);
        }

        async _isOrderValid() {
            const missingFields = this.missingPartnerFields();
            if (missingFields.length > 0) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Missing customer data"),
                    body:
                        this.env._t(
                            "Some data on the customer you picked are missing. Use the customer screen to edit: "
                        ) + missingFields.join(", "),
                });
                return false;
            }
            return super._isOrderValid(...arguments);
        }
    };

Registries.Component.extend(PaymentScreen, RequiredFieldsPaymentScreen);

export default PaymentScreen;
