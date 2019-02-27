/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define(

    'pos_require_product_quantity.pos_require_product_quantity',
    function (require) {
        "use strict";

        var core = require('web.core');
        var screens = require("point_of_sale.screens");

        var _t = core._t;

        screens.ActionpadWidget = screens.ActionpadWidget.include({
            renderElement: function () {
                var self = this;
                this._super();

                this.$('.pay').click(function () {

                    if (self.pos.config.require_product_quantity) {

                        var orderlines = self.pos.get_order().orderlines;
                        var qty_unset_list = [];

                        for (var i = 0; i < orderlines.length; i++) {
                            var line = orderlines.models[i];
                            if (line.quantity === 0) {
                                qty_unset_list.push(line);
                            }
                        }
                        if (qty_unset_list.length > 0) {
                            self.gui.back();
                            var body = _t('No quantity set for products:');
                            for (var j = 0; j < qty_unset_list.length; j++) {
                                body = (
                                    body
                                    + '  - '
                                    + qty_unset_list[j].product.display_name
                                );
                            }
                            self.gui.show_popup(
                                'alert',
                                {
                                    'title': _t('Missing quantities'),
                                    'body': body,
                                },
                            );
                        }
                    }
                });
            }
        })
    }
);
