// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("base_pos_self_service_weighing.SelfServiceScreen", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class SelfServiceScreen extends PosComponent {}

    SelfServiceScreen.template = "base_pos_self_service_weighing.SelfServiceScreen";

    Registries.Component.add(SelfServiceScreen);

    return SelfServiceScreen;
});
