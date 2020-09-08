/*
    Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_empty_home.screens', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');

    chrome.UsernameWidget.include({
        click_username: function(){
            if (this.pos.config.iface_change_cashier) {
                this._super();
            }
        },
    });

});
