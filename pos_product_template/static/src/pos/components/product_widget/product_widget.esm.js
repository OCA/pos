/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Luis Rodríguez (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {ProductTemplateCard} from "../product_template_card/product_template_card.esm";
import {ProductsWidget} from "@point_of_sale/app/screens/product_screen/product_list/product_list";
import {patch} from "@web/core/utils/patch";

patch(ProductsWidget, {
    components: {...ProductsWidget.components, ProductTemplateCard},
});
patch(ProductsWidget.prototype, {
    get productsToDisplay() {
        var tmpl_seen = [];
        var res = super.productsToDisplay.filter(function (product) {
            if (tmpl_seen.indexOf(product.product_tmpl_id) === -1) {
                // First time we see it, display it
                tmpl_seen.push(product.product_tmpl_id);
                return true;
            }
            return false;
        });
        return res;
    },
});
