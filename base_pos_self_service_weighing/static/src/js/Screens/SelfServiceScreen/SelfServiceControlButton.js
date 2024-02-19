// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define(
    "base_pos_self_service_weighing.SelfServiceControlButton",
    function (require) {
        "use strict";

        const PosComponent = require("point_of_sale.PosComponent");
        const Registries = require("point_of_sale.Registries");

        class SelfServiceControlButton extends PosComponent {
            get name() {
                return null;
            }

            get faSymbol() {
                return null;
            }
        }

        SelfServiceControlButton.template =
            "base_pos_self_service_weighing.SelfServiceControlButton";

        Registries.Component.add(SelfServiceControlButton);

        return SelfServiceControlButton;
    }
);
