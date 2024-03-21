// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("pos_self_service_weight_base.Chrome", function (require) {
    "use strict";

    const Chrome = require("point_of_sale.Chrome");
    const Registries = require("point_of_sale.Registries");

    const SelfServiceChrome = (Chrome_) =>
        class extends Chrome_ {
            /**
             * @override
             * `SelfServiceScreen` is the start screen if the POS is configured
             * as a self-service pos..
             */
            get startScreen() {
                // Calling super first because it logs an error in some cases.
                var result = super.startScreen;
                if (this.env.pos.config.is_self_service_weight_point) {
                    return {name: "SelfServiceScreen"};
                }
                return result;
            }
        };

    Registries.Component.extend(Chrome, SelfServiceChrome);
});
