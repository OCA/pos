// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("pos_self_service_weight_base.SelfServiceActionButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class SelfServiceActionButton extends PosComponent {
        get name() {
            return null;
        }

        get icoName() {
            return null;
        }
    }

    SelfServiceActionButton.template =
        "pos_self_service_weight_base.SelfServiceActionButton";

    Registries.Component.add(SelfServiceActionButton);

    return SelfServiceActionButton;
});
