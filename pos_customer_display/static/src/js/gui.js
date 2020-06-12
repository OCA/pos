/*
Copyright (C) 2020-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_customer_display.gui', function (require) {
    "use strict";

    var gui = require('point_of_sale.gui');

    gui.Gui.include({

        close: function(){
            this.pos.proxy.send_text_customer_display(
                this.pos.proxy.prepare_message_close()
            );
            return this._super();
        },

    });

});
