/** @odoo-module **/

/* Copyright apertoso NV- Jos DE GRAEVE <Jos.DeGraeve@apertoso.be>
   Copyright La Louve - Sylvain LE GAL <https://twitter.com/legalsylvain>
   Copyright NuoBiT - Eric Antones <eantones@nuobit.com>
   Copyright NuoBiT - Kilian Niubo <kniubo@nuobit.com>
   Copyright CoopITEasy - Simon Hick <sim@coopiteasy.be>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import PaymentScreen from "point_of_sale.PaymentScreen";
import Registries from "point_of_sale.Registries";
// Import {_t} from "@web/core/l10n/translation";

const PosRequiredCustomerPaymentScreen = (OriginalPaymentScreen) =>
    class extends OriginalPaymentScreen {
        setup() {
            super.setup(...arguments);
        }

        async _isOrderValid(isForceValidate) {
            if (
                this.env.pos.config.require_customer !== "no" &&
                !this.env.pos.get_order().get_partner()
            ) {
                const result = await this.showPopup("ConfirmPopup", {
                    title: this.env._t("An anonymous order cannot be confirmed"),
                    body: this.env._t("Please select a customer for this order."),
                });
                if (result.confirmed) {
                    await this.selectPartner();
                }
                return false;
            }
            return super._isOrderValid(isForceValidate);
        }
    };

Registries.Component.extend(PaymentScreen, PosRequiredCustomerPaymentScreen);
