/**
Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define("pos_pricelist_technical.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");

    screens.set_pricelist_button.include({

        /* Overwrite button_click function to remove technical pricelist
        */
        button_click: function () {
            var self = this;

            /*Begin of the changes */
            var pricelists = _.filter(self.pos.pricelists, function(pricelist) {
                return ! pricelist.is_technical;
            });
            /*End of the changes */

            pricelists = _.map(pricelists, function (pricelist) {
                return {
                    label: pricelist.name,
                    item: pricelist
                };
            });

            self.gui.show_popup("selection",{
                title: _t("Select pricelist"),
                list: pricelists,
                confirm: function (pricelist) {
                    var order = self.pos.get_order();
                    order.set_pricelist(pricelist);
                },
                is_selected: function (pricelist) {
                    return pricelist.id === self.pos.get_order().pricelist.id;
                }
            });
        },

    });
});