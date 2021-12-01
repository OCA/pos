/*
Copyright (C) 2020-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.gui", function(require) {
    "use strict";

    const gui = require("point_of_sale.gui");

    gui.Gui.include({
        close: function() {
            if (this.pos.proxy.shouldUpdateCustomerDisplay()) {
                this.pos.proxy.sendCustomerDisplayText(
                    this.pos.proxy.prepareCustomerDisplayMessage("close")
                );
            }
            return this._super.apply(this, arguments);
        },
    });
});
