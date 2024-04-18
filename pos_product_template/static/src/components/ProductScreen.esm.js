/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Luis Rodríguez (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";

/* ********************************************************
    Overload: point_of_sale.ProductListWidget

    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */
import {patch} from "@web/core/utils/patch";
patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
    },
    async _clickProductTemplate(event) {
        // Display our select-variant popup when needed
        // chain call to clickProduct
        var product = event.detail;
        var ret = await this.showPopup("SelectVariantPopup", {
            template_id: product.product_tmpl_id,
        });
        if (ret.confirmed && ret.payload)
            return this._clickProduct({detail: ret.payload});
    },
});
