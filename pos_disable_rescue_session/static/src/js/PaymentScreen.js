/*
    Copyright 2023 Akretion (http://www.akretion.com).
    @author Florian Mounier <florian.mounier@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

const RescueSessionUnavailableError =
    "odoo.addons.pos_disable_rescue_session.models.pos_order.RescueSessionUnavailableError";

odoo.define("pos_disable_rescue_session.PaymentScreen", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const PaymentScreen = require("point_of_sale.PaymentScreen");

    // There is a bug in the pos, error popups are shown twice on payment.
    // Once in the PaymentScreen and once in the CrashManager.
    // This is a workaround to disable the popup in the CrashManager for this specific error.
    // in order to show the right popup in the PaymentScreen.
    const core = require("web.core");
    core.crash_registry.add(
        RescueSessionUnavailableError,
        class DoNothing {
            display() {
                return false;
            }
        }
    );

    // Now we need to extend the PaymentScreen to show the RescueSessionUnavailableErrorPopup
    // instead of the ErrorPopup when the corresponding error is thrown.
    const PaymentScreenDisableRescueSession = (PaymentScreen) =>
        class PaymentScreenDisableRescueSession extends PaymentScreen {
            constructor() {
                // The super patches the _handlePushOrderError method.
                // We can't directly inherit it.
                super(...arguments);

                // Keep original patched method to call it later.
                this._originalHandlePushOrderError = this._handlePushOrderError;

                // Repatch the method to call the new method.
                this._handlePushOrderError = this._handlePushOrderErrorPatched.bind(
                    this
                );
            }
            async _handlePushOrderErrorPatched(error) {
                // If the error is the RescueSessionUnavailableError, show the
                // RescueSessionUnavailableErrorPopup.
                if (
                    error.message !== "Backend Invoice" &&
                    error.code === 200 &&
                    error.data.name == RescueSessionUnavailableError
                ) {
                    return await this.showPopup("RescueSessionUnavailableErrorPopup", {
                        title: this.env._t("Session Is Closed"),
                        body: error.data.message,
                    });
                }
                // Otherwise call the original patched method.
                return await this._originalHandlePushOrderError(error);
            }
        };
    Registries.Component.extend(PaymentScreen, PaymentScreenDisableRescueSession);
});
