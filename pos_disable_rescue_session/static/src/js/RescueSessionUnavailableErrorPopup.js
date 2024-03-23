/*
    Copyright 2023 Akretion (http://www.akretion.com).
    @author Florian Mounier <florian.mounier@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_disable_rescue_session.RescueSessionUnavailableErrorPopup", function (
    require
) {
    "use strict";

    const ErrorPopup = require("point_of_sale.ErrorPopup");
    const Registries = require("point_of_sale.Registries");

    class RescueSessionUnavailableErrorPopup extends ErrorPopup {
        dontShowAgain() {
            this.constructor.dontShow = true;
            this.cancel();
        }
    }
    RescueSessionUnavailableErrorPopup.template = "RescueSessionUnavailableErrorPopup";
    RescueSessionUnavailableErrorPopup.dontShow = false;
    RescueSessionUnavailableErrorPopup.defaultProps = {
        confirmText: "Ok",
        cancelText: "Cancel",
        title: "Session Is Closed",
        body: "This PoS session has been closed.",
    };

    Registries.Component.add(RescueSessionUnavailableErrorPopup);

    return RescueSessionUnavailableErrorPopup;
});
