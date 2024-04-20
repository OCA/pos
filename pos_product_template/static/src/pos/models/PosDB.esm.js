/** @odoo-module **/
/* Copyright (C) 2024-Today Dixmit (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {PosDB} from "@point_of_sale/app/store/db";
import {patch} from "@web/core/utils/patch";

patch(PosDB.prototype, {
    add_products(products) {
        if (this.product_by_template_id === undefined) {
            this.product_by_template_id = {};
        }
        if (!(products instanceof Array)) {
            // eslint-disable-next-line no-param-reassign
            products = [products];
        }
        for (var i = 0, len = products.length; i < len; i++) {
            var product = products[i];
            if (product.id in this.product_by_id) {
                continue;
            }
            var product_tmpl_id = product.product_tmpl_id[0];
            if (product.available_in_pos) {
                if (!this.product_by_template_id[product_tmpl_id]) {
                    this.product_by_template_id[product_tmpl_id] = [];
                }
                this.product_by_template_id[product_tmpl_id].push(product.id);
            }
        }
        super.add_products(products);
    },
    get_product_by_template: function (template_id) {
        var product_ids = this.product_by_template_id[template_id];
        var list = [];
        if (product_ids) {
            for (
                var i = 0, len = Math.min(product_ids.length, this.limit);
                i < len;
                i++
            ) {
                const product = this.product_by_id[product_ids[i]];
                if (!this.shouldAddProduct(product, list)) {
                    continue;
                }
                list.push(product);
            }
        }
        return list;
    },
});
