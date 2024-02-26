/** @odoo-module **/
/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import PosComponent from "point_of_sale.PosComponent";
import ProductItem from "point_of_sale.ProductItem";
import ProductScreen from "point_of_sale.ProductScreen";
import ProductsWidget from "point_of_sale.ProductsWidget";
import Registries from "point_of_sale.Registries";
import {useListener} from "@web/core/utils/hooks";

/* ********************************************************
    Overload: point_of_sale.ProductListWidget

    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */

const PPTProductScreen = (ProductScreen) =>
    class extends ProductScreen {
        setup() {
            super.setup();
            useListener("click-product-template", this._clickProductTemplate);
        }
        async _clickProductTemplate(event) {
            // Display our select-variant popup when needed
            // chain call to clickProduct
            var product = event.detail;
            var ret = await this.showPopup("SelectVariantPopup", {
                template_id: product.product_tmpl_id,
            });
            if (ret.confirmed && ret.payload)
                return this._clickProduct({detail: ret.payload});
        }
    };

const PPTProductsWidget = (ProductsWidget) =>
    class extends ProductsWidget {
        get productsToDisplay() {
            const tmpl_seen = [];
            let res = super.productsToDisplay;
            if (this.env.pos.config.iface_show_product_template) {
                res = super.productsToDisplay
                    .filter(function (product) {
                        if (tmpl_seen.indexOf(product.product_tmpl_id) === -1) {
                            // First time we see it, display it
                            tmpl_seen.push(product.product_tmpl_id);
                            return true;
                        }
                        return false;
                    })
                    .slice(0, this.env.pos.db.product_display_limit);
            }
            return res;
        }
    };

const PPTProductItem = (ProductItem) =>
    class extends ProductItem {
        setup() {
            super.setup();
            if (this.props.forceVariant) {
                // In order to not recurse indefinitely
            } else if (
                this.env.pos.config.iface_show_product_template &&
                this.props.product.product_variant_count > 1
            ) {
                useListener("click", this.onClick);
                const ctx = Object.assign(Object.create(this), {this: this});
                this.__owl__.renderFn = this.__owl__.app
                    .getTemplate("ProductTemplateItem")
                    .bind(this, ctx, this);
            }
        }
        get imageTmpUrl() {
            const product = this.props.product;
            return `/web/image?model=product.template&field=image_128&id=${product.product_tmpl_id}&write_date=${product.write_date}&unique=1`;
        }
        async onClick() {
            // Display our select-variant popup when needed
            // chain call to clickProduct
            const product = this.props.product;
            const ret = await this.showPopup("SelectVariantPopup", {
                template_id: product.product_tmpl_id,
            });
            if (ret.confirmed && ret.payload)
                this.trigger("click-product", ret.payload);
        }
    };

class AttributeValueItem extends PosComponent {
    setup() {
        super.setup();
        useListener("click", this.onClick);
    }
    onClick(event) {
        this.trigger("click-attribute-value", event);
    }
}

AttributeValueItem.template = "AttributeValueItem";

Registries.Component.add(AttributeValueItem);

Registries.Component.extend(ProductScreen, PPTProductScreen);
Registries.Component.extend(ProductItem, PPTProductItem);
Registries.Component.extend(ProductsWidget, PPTProductsWidget);

export default {
    PPTProductScreen: PPTProductScreen,
    PPTProductItem: PPTProductItem,
    PPTProductsWidget: PPTProductsWidget,
    AttributeValueItem: AttributeValueItem,
};
