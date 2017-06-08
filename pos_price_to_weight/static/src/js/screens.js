/*
    Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_price_to_weight.screens', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');

    screens.ScreenWidget.include({
        show: function(){
            this._super();
            var self = this;
            this.pos.barcode_reader.set_action_callback({
                'price_to_weight': _.bind(self.barcode_product_action, self),
            });
        },
    });
});
