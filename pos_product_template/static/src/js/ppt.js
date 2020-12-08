/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.pos_product_template", function(require){
    "use strict";

    const ppt_models = require('pos_product_template.models');

    var ProductsWidget = require('point_of_sale.ProductsWidget');
    var ProductItem = require('point_of_sale.ProductItem');
    var ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require('point_of_sale.Registries');
    const PosComponent = require('point_of_sale.PosComponent');
    const { useListener } = require('web.custom_hooks');


    /* ********************************************************
    Overload: point_of_sale.ProductListWidget

    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */

    const PPTProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            constructor(parent, props) {
                super(parent, props);
                useListener('click-product-template', this._clickProductTemplate);
            }
            async _clickProductTemplate (event) {
                // Display our select-variant popup when needed
                // chain call to clickProduct
                var product = event.detail;
                var ret = await this.showPopup('SelectVariantPopup', { 'template_id': product.product_tmpl_id });
                if (ret.confirmed)
                    return this._clickProduct({detail: ret.payload});
            }
        }

    const PPTProductsWidget = (ProductWidget) =>
        class extends ProductsWidget {
            get productsToDisplay() {
    //         /* ************************************************
    //         Overload: 'set_product_list'

    //         'set_product_list' is a function called before displaying Products.
    //         (at the beginning, after a category selection, after a research, etc.
    //         we just remove all products that are not the 'primary variant'
    //         */
                var tmpl_seen = [] 
                var res = super.productsToDisplay.filter(function(product) {
                    if (tmpl_seen.indexOf(product.product_tmpl_id) === -1) {
                        // first time we see it, display it
                        tmpl_seen.push(product.product_tmpl_id);
                        return true;
                    }
                    return false;
                }).slice(0, this.env.pos.db.product_display_limit);
                return res;
            }
        }

    const PPTProductItem = (ProductItem) =>
        class extends ProductItem {
            constructor(parent, props) {
                // reuse ProductItem but change only
                // the template for product.template
                super(parent, props);
                if (props.forceVariant) {
                    // in order to not recurse indefinitly
                } else if (props.product.product_variant_count > 1) {
                    var qweb = this.env.qweb;
                    this.__owl__.renderFn = qweb.render.bind(qweb, "ProductTemplateItem")
                }
            }
        }

    class AttributeValueItem extends PosComponent {
        constructor(parent, props) {
            super(parent, props);
        }

        spaceClickProduct(event) {
            if (event.which === 32) {
                this.trigger('click-product', this.props.product);
            }
        }
        
    }

    AttributeValueItem.template = 'AttributeValueItem';

    Registries.Component.add(AttributeValueItem);

    Registries.Component.extend(ProductScreen, PPTProductScreen);
    Registries.Component.extend(ProductItem, PPTProductItem);
    Registries.Component.extend(ProductsWidget, PPTProductsWidget);

    return {
        PPTProductScreen: PPTProductScreen,
        PPTProductItem: PPTProductItem,
        PPTProductsWidget: PPTProductsWidget,
        AttributeValueItem: AttributeValueItem
    };

});
