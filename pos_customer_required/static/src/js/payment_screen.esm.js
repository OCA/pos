/* Copyright apertoso NV- Jos DE GRAEVE <Jos.DeGraeve@apertoso.be>
   Copyright La Louve - Sylvain LE GAL <https://twitter.com/legalsylvain>
   Copyright NuoBiT - Eric Antones <eantones@nuobit.com>
   Copyright NuoBiT - Kilian Niubo <kniubo@nuobit.com>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    async _isOrderValid(isForceValidate) {
        if (
            (this.pos.config.require_customer === "payment" ||
                this.pos.config.require_customer === "order") &&
            !this.currentOrder.get_partner()
        ) {
            this.dialog.add(ConfirmationDialog, {
                title: _t("An anonymous order cannot be confirmed"),
                body: _t("Please select a customer for this order!"),
                confirm: () => this.pos.selectPartner(),
            });
            return false;
        }
        return super._isOrderValid(isForceValidate);
    },
});
