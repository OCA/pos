/** @odoo-module **/
/* Copyright (C) 2024-Today Dixmit
    @author Luis Rodríguez (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {Product} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

patch(Product.prototype, {
    get getImageTmplUrl() {
        return `/web/image?model=product.template&field=image_128&id=${this.product_tmpl_id}&write_date=${this.write_date}&unique=1`;
    },
});
