/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 odoo.define("pos_pwa_oca.webclient", function (require) {
    "use strict";
    const Chrome = require("point_of_sale.Chrome");
    const Registries = require('point_of_sale.Registries');
    var PWAManager = require("pos_pwa_oca.PWAManager");

    const PosPWA = (Chrome) =>
        class extends Chrome {
        start() {
            this.pwa_manager = new PWAManager(this);
            return super.start();
        }
    };

    Registries.Component.extend(Chrome, PosPWA);

    return Chrome;
});
