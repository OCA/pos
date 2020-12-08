/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.SelectVariantPopup", function(require){
    "use strict";

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const { useState } = owl.hooks;

    class SelectVariantPopup extends AbstractAwaitablePopup {
        constructor(parent, props) {
            super(parent, props);
            var template = this.env.pos.db.get_template_by_id(props.template_id);
            this.state = useState({ ptav: [], attributes: [], template: template, products: [], ptav_id_selected: {} });
            var ptav = Array.from(new Set(template.product_template_attribute_value_ids.map( x =>
                this.env.pos.db.get_product_template_attribute_value_by_id(x)
            )));

            var attributes_by_id = {};
            ptav.forEach( x => {
                var id = x.attribute_id[0];
                var value_id = x.product_attribute_value_id[0];
                attributes_by_id[id] = attributes_by_id[id] || { "attribute": x.attribute_id, "values_id": {}, "ptav": {}};
                attributes_by_id[id].values_id[value_id] = true;
                attributes_by_id[id].ptav[x.id] = x;
            });
            var attributes = Object.values(attributes_by_id).map( x => {
                x.ptav = Object.values(x.ptav);
                x.id = x.attribute[0];
                x.name = x.attribute[1];
                return x;
            });
            this.all_ptav_id = ptav.map(x => x.id);
            this.all_ptav = {}

            ptav.forEach(x=> this.all_ptav[x.id] = x )

            var products = this.refreshProducts()
            useListener('click-product', this._clickProduct);
            useListener('click-attribute-value', this._clickAttributeValue);

            this.state.ptav = ptav;
            this.state.attributes = attributes;
            this.state.products = products;

        }

        async _clickProduct(event) {
            this.product_selected = event.detail
            return this.confirm()
        }
        async _clickAttributeValue(event) {
            var value_id = event.detail.id;
            //init
            var ptav = this.state.ptav_id_selected;
            ptav[value_id] = ptav[value_id] || false;
            //toggle
            ptav[value_id] = !ptav[value_id];
            this.state.products = this.refreshProducts()
        }
        async getPayload() {
            return this.product_selected;
        }
        refreshProducts() {

            function intersection(setA, setB) {
              var intersection = new Set();
              for (var elem of setB) {
                if (setA.has(elem)) {
                  intersection.add(elem);
                }
              }
              return intersection;
            }

            function union(setA, setB) {
              var union = new Set(setA);
              for (var elem of setB) {
                union.add(elem);
              }
              return union;
            }

            var ptav = Object.keys(this.state.ptav_id_selected).filter(x => this.state.ptav_id_selected[x]);
            if (!ptav.length) {
                ptav = this.all_ptav_id;
                var variants_ids = ptav.map( ptav => {
                    return new Set(this.all_ptav[ptav].ptav_product_variant_ids);
                }).reduce( (a, b) => {
                    return union(a,b);
                });
            } else {
                var variants_ids = ptav.map( ptav => {
                    return new Set(this.all_ptav[ptav].ptav_product_variant_ids);
                }).reduce( (a, b) => {
                    return intersection(a,b);
                });
            }
            return Array.from(variants_ids).map( x => {
                return this.env.pos.db.get_product_by_id(x);
            });
        }
    }
    SelectVariantPopup.template = 'SelectVariantPopup';
    SelectVariantPopup.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        body: '',
    };

    Registries.Component.add(SelectVariantPopup);
    return SelectVariantPopup;
});