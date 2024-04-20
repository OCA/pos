/** @odoo-module **/
/* Copyright (C) 2024-Today Dixmit
    @author Luis Rodríguez (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {Component} from "@odoo/owl";
import {ProductSelector} from "../product_selector/product_selector.esm";
import {useService} from "@web/core/utils/hooks";

export class ProductTemplateCard extends Component {
    setup() {
        super.setup();
        this.popup = useService("popup");
    }
    async onClick() {
        this.popup.add(ProductSelector, {
            ...this.props,
        });
    }
}
ProductTemplateCard.template = "pos_product_template.ProductTemplateCard";
ProductTemplateCard.props = {
    class: {String, optional: true},
    name: String,
    productId: Number,
    productTmplId: Number,
    product: Object,
    price: String,
    imageUrl: [String, Boolean],
    template_variants: Number,
    onClick: {type: Function, optional: true},
};
ProductTemplateCard.defaultProps = {
    // eslint-disable-next-line no-empty-function
    onClick: () => {},
    class: "",
};
