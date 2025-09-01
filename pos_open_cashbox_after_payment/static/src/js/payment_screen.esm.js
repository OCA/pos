/** @odoo-module **/
/** Copyright 2025 Bernat Obrador (APSL-Nagarro)<borbador@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). **/

import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    async _finalizeValidation() {
        await super._finalizeValidation(...arguments);
        this.hardwareProxy.openCashbox();
    },
});
