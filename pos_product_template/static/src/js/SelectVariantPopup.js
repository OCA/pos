/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.SelectVariantPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    class SelectVariantPopup extends AbstractAwaitablePopup {
        constructor(parent, props) {
            super(parent, props);
            var template = this.env.pos.db.get_template_by_id(props.template_id);
            this.state = useState({
                ptav: [],
                attributes: [],
                template: template,
                products: [],
                ptav_id_selected: {},
                ptav_unavailable_ids: [],
                all_attributes_chosen: false,
            });

            this._mountPopup(template);
        }

        willUpdateProps(nextProp) {
            var template = this.env.pos.db.get_template_by_id(nextProp.template_id);
            this._mountPopup(template);
            super.willUpdateProps(nextProp);
        }

        _mountPopup(template) {
            this.state.ptav = [];
            this.state.attributes = [];
            this.state.template = template;
            this.state.products = [];
            this.state.ptav_id_selected = {};

            var ptav = Array.from(
                new Set(
                    template.product_template_attribute_value_ids.map((x) =>
                        this.env.pos.db.get_product_template_attribute_value_by_id(x)
                    )
                )
            );

            var attributes_by_id = {};
            ptav.forEach((x) => {
                var id = x.attribute_id[0];
                var value_id = x.product_attribute_value_id[0];
                attributes_by_id[id] = attributes_by_id[id] || {
                    attribute: x.attribute_id,
                    values_id: {},
                    ptav: {},
                };
                attributes_by_id[id].values_id[value_id] = true;
                attributes_by_id[id].ptav[x.id] = x;
            });
            var attributes = Object.values(attributes_by_id).map((x) => {
                x.ptav = Object.values(x.ptav);
                x.id = x.attribute[0];
                x.name = x.attribute[1];
                return x;
            });
            this.all_ptav_id = ptav.map((x) => x.id);
            this.all_ptav = {};

            ptav.forEach((x) => (this.all_ptav[x.id] = x));

            var products = this.refreshProducts();
            useListener("click-product", this._clickProduct);
            useListener("click-attribute-value", this._clickAttributeValue);

            attributes.forEach((attribute) => {
                const productAttribute = this.env.pos.db.product_attribute_by_id[
                    attribute.id
                ];
                attribute.sequence = productAttribute.sequence;
            });

            this.state.ptav = ptav;
            this.state.ptav_unavailable_ids = [];
            this.state.attributes = attributes.sort((a, b) =>
                a.sequence > b.sequence ? 1 : b.sequence > a.sequence ? -1 : 0
            );
            this.state.products = products;
        }

        async _clickProduct(event) {
            this.product_selected = event.detail;
            return this.confirm();
        }
        async _clickAttributeValue(event) {
            var value_id = event.detail.id;
            // Init
            var ptav = this.state.ptav_id_selected;
            ptav[value_id] = ptav[value_id] || false;
            // Toggle
            ptav[value_id] = !ptav[value_id];

            var avat = {};
            var attributes_stringify = JSON.parse(
                JSON.stringify(this.state.attributes)
            );
            _.each(attributes_stringify, function (at) {
                _.each(at.ptav, function (av) {
                    avat[av.id] = at.id;
                });
            });

            var ptav_stringify = JSON.parse(
                JSON.stringify(this.state.ptav_id_selected)
            );
            _.each(Object.keys(ptav_stringify), function (ptav_s) {
                if (ptav_s != value_id && avat[ptav_s] == avat[value_id]) {
                    ptav[ptav_s] = false;
                }
            });

            this.state.products = this.refreshProducts();
            var self = this;
            var selected_ptav_ids = Object.keys(self.state.ptav_id_selected).filter(
                (x) => self.state.ptav_id_selected[x]
            );
            this.state.ptav_unavailable_ids = this.state.ptav
                .filter(function (value) {
                    // Remove ptav if no available product corresponds
                    var res = self.state.products.every(function (product) {
                        return (
                            value.ptav_product_variant_ids.includes(product.id) ===
                            false
                        );
                    });
                    if (res === true) {
                        // Do not remove ptav if there is already a ptav chosen for the
                        // attribute and there are products if changed
                        // This allows to show the possible modifications of choices
                        selected_ptav_ids.forEach(function (selected_ptav_id) {
                            const selected_ptav = self.all_ptav[selected_ptav_id];
                            if (
                                value.attribute_id[0] === selected_ptav.attribute_id[0]
                            ) {
                                const selected_ptav_test_list = selected_ptav_ids.filter(
                                    function (id) {
                                        // Test if ptav is available if this ptav is not selected
                                        return id !== selected_ptav_id;
                                    }
                                );
                                const product_ids = Array.from(
                                    self._get_product_ids_for_ptav(
                                        selected_ptav_test_list
                                    )
                                );
                                res = product_ids.every(function (product_id) {
                                    return (
                                        value.ptav_product_variant_ids.includes(
                                            product_id
                                        ) === false
                                    );
                                });
                            }
                        });
                    }
                    return res;
                })
                .map(function (value) {
                    return value.id;
                });
            this.state.all_attributes_chosen =
                selected_ptav_ids.length === this.state.attributes.length &&
                this.state.products.length === 1;
        }
        async click_confirm() {
            if (this.state.all_attributes_chosen !== true) {
                throw "You can only confirm when all attributes are chosen and there is a variant available";
            }
            this.product_selected = this.state.products[0];
            return this.confirm();
        }
        async getPayload() {
            return this.product_selected;
        }
        _get_product_ids_for_ptav(ptav) {
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

            if (!ptav.length) {
                ptav = this.all_ptav_id;
                var variants_ids = ptav
                    .map((ptav) => {
                        return new Set(this.all_ptav[ptav].ptav_product_variant_ids);
                    })
                    .reduce((a, b) => {
                        return union(a, b);
                    });
            } else {
                var variants_ids = ptav
                    .map((ptav) => {
                        return new Set(this.all_ptav[ptav].ptav_product_variant_ids);
                    })
                    .reduce((a, b) => {
                        return intersection(a, b);
                    });
            }
            return variants_ids;
        }
        refreshProducts() {
            var ptav = Object.keys(this.state.ptav_id_selected).filter(
                (x) => this.state.ptav_id_selected[x]
            );
            var variants_ids = this._get_product_ids_for_ptav(ptav);
            return Array.from(variants_ids).map((x) => {
                return this.env.pos.db.get_product_by_id(x);
            });
        }
    }
    SelectVariantPopup.template = "SelectVariantPopup";
    SelectVariantPopup.defaultProps = {
        confirmText: "Ok",
        cancelText: "Cancel",
        body: "",
    };

    Registries.Component.add(SelectVariantPopup);
    return SelectVariantPopup;
});
