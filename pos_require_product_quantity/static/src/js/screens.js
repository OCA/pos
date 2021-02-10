/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_require_product_quantity.screens', function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var core = require('web.core');
    var _t = core._t;

    screens.ActionpadWidget.include({
        renderElement: function () {
            var self = this;
            this._super();

            if (self.pos.config.require_product_quantity) {
                this.$('.pay').click(function () {
                    var lines_without_qty = _.filter(
                        self.pos.get_order().get_orderlines(),
                        function(line) { return line.quantity === 0 }
                    );
                    if (lines_without_qty.length > 0) {
                        self.gui.back();
                        self.gui.show_popup(
                            'alert',
                            {
                                'title': _t('Missing quantities'),
                                'body': (
                                    _t('No quantity set for products:')
                                    + '\n'
                                    + _.map(lines_without_qty, function(line) { return ' - ' + line.product.display_name }).join('\n')
                                ),
                            },
                        );
                    }
                });
            }
        }
    });

    return screens;
});
