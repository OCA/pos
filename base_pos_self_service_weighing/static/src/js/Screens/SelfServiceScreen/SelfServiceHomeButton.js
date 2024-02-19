// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("base_pos_self_service_weighing.SelfServiceHomeButton", function (require) {
    "use strict";

    const SelfServiceControlButton = require("base_pos_self_service_weighing.SelfServiceControlButton");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("@web/core/utils/hooks");
    const {Gui} = require("point_of_sale.Gui");

    class SelfServiceHomeButton extends SelfServiceControlButton {
        setup() {
            super.setup();
            useListener("click", this._onClick);
        }

        get name() {
            return "Home";
        }

        get faSymbol() {
            return "fa-home";
        }

        async _onClick() {
            Gui.showScreen("SelfServiceScreen");
        }
    }

    SelfServiceHomeButton.template =
        "base_pos_self_service_weighing.SelfServiceControlButton";

    Registries.Component.add(SelfServiceHomeButton);

    return SelfServiceHomeButton;
});
