/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Luis Rodríguez (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";

/* ********************************************************
    Overload: point_of_sale.ProductListWidget

    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */
import {patch} from "@web/core/utils/patch";
console.log("adeu");

patch(ProductCard.prototype, {
    get imageTmpUrl() {
        const product = this.props.product;
        return `/web/image?model=product.template&field=image_128&id=${product.template.id}&write_date=${product.write_date}&unique=1`;
    },
    async onclick() {
        return this.props.onclick();
    },
});
