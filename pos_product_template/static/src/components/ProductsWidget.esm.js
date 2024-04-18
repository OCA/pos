/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Luis Rodríguez (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {ProductsWidget} from "@point_of_sale/app/screens/product_screen/product_list/product_list";

/* ********************************************************
    Overload: point_of_sale.ProductListWidget

    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */
import {patch} from "@web/core/utils/patch";
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
