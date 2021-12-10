/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("pos_pwa_oca.webclient", function (require) {
    "use strict";
    var chrome = require('point_of_sale.chrome');
    var PWAManager = require("pos_pwa_oca.PWAManager");

    chrome.Chrome.include({
        start: function () {
            this.pwa_manager = new PWAManager(this);
            return this._super.apply(this, arguments);
        },
      });
});
