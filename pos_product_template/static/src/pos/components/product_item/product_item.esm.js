/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Luis Rodríguez (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {patch} from "@web/core/utils/patch";

patch(ProductCard.prototype, {
    get imageTmpUrl() {
        const product = this.props.product;
        return `/web/image?model=product.template&field=image_128&id=${product.template.id}&write_date=${product.write_date}&unique=1`;
    },
    async onClick() {
        return this.props.onClick();
    },
});
