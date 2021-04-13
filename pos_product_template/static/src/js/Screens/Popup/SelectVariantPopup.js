/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.SelectVariantPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    /*
    The objective of the popup is to end up with exactly 1 variant
    selected.

    The popup works in the following way: say we have N attributes,
    each attribute has X number of attribute values.

    Each attribute has its own section selector (to select an attribute value).
    Selectors are stacked vertically, one after the other.

    First, the user must select one attribute from the first selector.
    The user must then progress downwards, choosing one option per selector.

    Once the user reaches the end (has chosen one option for every selector),
    the user can click confirm to add his product.

    The user can go back to a previous level by selecting a different option.
    Every choice in-between is reset (discarded) and he can start over at the
    selected level.

    Selector options are updated dynamically according to possible variant combinations.
    Take the following scenario:
    My product template is a T-shirt.
    There are 2 attributes: color (black, red), and size (M, L).
    But not all combinations exist. We don't have T-shirts of color Red and size L.
    Then on the selectors, if we choose Red color, then the Large option will be greyed out.

    It would be possible to make a more complex menu (for example show a list of
    variants that match the selected options before reaching the end).
    But we deliberately chose to replicate simple UX commonly found on most eCommerce websites.

    Technically, the available choices are computed every time an option is selected and stored
    in a cache to avoid recomputing every possible choice every time a choice is made.
    */

    class SelectVariantPopup extends AbstractAwaitablePopup {
        constructor(parent, props) {
            super(parent, props);
            useListener("click-av-option", this.clickAvOption);
            useListener("collapse-other-selectors", this.collapseOtherSelectors);
            useListener("click-confirm", this.onClickConfirm);
            this.config = this.props.config;
            this.state = useState({
                current_level: 0,
                button_confirm_clickable: false,
            });
        }

        // Events

        registerSelector(selector) {
            this.config.selectors.push(selector);
            if (this.config.selectors.length === 1) {
                this.updateChoices(0);
            }
        }

        collapseOtherSelectors(ev) {
            for (const selector of this.config.selectors) {
                if (selector !== ev.originalComponent) {
                    selector.state.display_options = false;
                }
            }
        }

        onReachFinalLevel() {
            var selector = this.config.selectors[this.state.current_level];
            this.product_selected = selector.state.cached_products[0];
            this.state.button_confirm_clickable = true;
        }

        clickAvOption(ev) {
            var target_level = ev.detail;
            if (target_level < this.state.current_level) {
                this.clearLevels(target_level);
                this.state.button_confirm_clickable = false;
            }
            this.state.current_level = target_level;
            this.updateCache(target_level);
            if (target_level === this.config.idx_final_level) {
                this.onReachFinalLevel();
            } else {
                this.updateChoices(target_level + 1);
            }
        }

        // Selection logic

        clearLevels(target_level) {
            // When we "go back" to a previous choice, clear all choices
            // and caches inbetween
            for (var i = target_level + 1; i <= this.config.idx_final_level; i++) {
                this.config.selectors[i].setInactive();
            }
        }

        getAvsFromProducts(av_id, products) {
            // For each product, get the attribute values that have av_id as parent
            var result = new Set();
            for (const product of products) {
                for (const ptav_id of product.product_template_attribute_value_ids) {
                    var ptav = this.env.pos.db.product_template_attribute_value_by_id[
                        ptav_id
                    ];
                    if (ptav.attribute_id[0] === av_id) {
                        result.add(ptav.product_attribute_value_id[0]);
                    }
                }
            }
            result = [...result];
            return result;
        }

        intersectProductsWithPtav(ptav, cached_products) {
            var valid_products = cached_products.filter(function (product) {
                return ptav.ptav_product_variant_ids.indexOf(product.id) >= 0;
            });
            return valid_products;
        }

        getCachedProducts(level) {
            if (level === 0) {
                var cached_products = Object.values(this.config.products);
            } else {
                var cached_products = this.config.selectors[
                    level - 1
                ].state.cached_products.slice();
            }
            return cached_products;
        }

        // TODO move logic to selector
        updateCache(level) {
            var selected_ptav = this.config.selectors[level].state.selected_option.ptav;
            var valid_products = this.intersectProductsWithPtav(
                selected_ptav,
                this.getCachedProducts(level)
            );
            this.config.selectors[level].cacheProducts(valid_products);
        }

        // TODO move logic to selector
        updateChoices(level) {
            var attribute_id = this.config.selectors[level].config.attribute.id;
            var avs_selectable_ids = this.getAvsFromProducts(
                attribute_id,
                this.getCachedProducts(level)
            );
            this.config.selectors[level].setActive(avs_selectable_ids);
        }

        async onClickConfirm() {
            return this.confirm();
        }

        async getPayload() {
            return this.product_selected;
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
