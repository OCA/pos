/* Copyright (C) 2014-Today Akretion (https://www.akretion.com)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    @author Kevin Khao (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.AttributeValueSelector", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const PosComponent = require("point_of_sale.PosComponent");
    const {useState, useExternalListener} = owl.hooks; // eslint-disable-line no-undef

    // Widget used for each individual attribute
    // Allows selection of one specific attribute value
    // option is an object with properties av_id, ptav_id

    class AttributeValueSelector extends PosComponent {
        constructor(parent, props) {
            super(parent, props);
            useExternalListener(window, "click", this.collapse);
            this.initConfig(props);
            this.state = useState({
                selectable_av_ids: [],
                selected_option: null,
                display_options: false,
                // Field clickable
                active: false,
                cached_products: [],
            });
            parent.registerSelector(this);
        }

        // Init

        initOptions() {
            // Note that for options we use both av and ptav, as ptav
            // saves us some performance calculation (we can access ptav_product_variant_ids)
            var options = [];
            for (const av_id of this.config.attribute.value_ids) {
                const ptav = Object.values(this.config.ptav).filter(function (item) {
                    return item.product_attribute_value_id[0] === av_id;
                })[0];
                if (ptav !== undefined) {
                    options.push({
                        av: this.env.pos.db.product_attribute_value_by_id[av_id],
                        ptav: ptav,
                    });
                }
            }
            this.config.options = options;
        }

        initPtav() {
            var tmpl_id = this.config.template.id;
            this.config.ptav = Object.values(
                this.env.pos.db.product_template_attribute_value_by_id
            ).filter(function (ptav) {
                return ptav.product_tmpl_id[0] === tmpl_id;
            });
        }

        initConfig(props) {
            this.config = {
                attribute: props.attribute,
                level: props.level,
                template: props.template,
            };
            this.initPtav();
            this.initOptions();
        }

        // State helpers

        setInactive() {
            this.state.active = false;
            this.state.selectable_av_ids = [];
            this.state.selected_option = null;
            this.state.cached_products = [];
        }

        setActive(selectable_av_ids) {
            this.state.active = true;
            this.state.selectable_av_ids = selectable_av_ids;
        }

        cacheProducts(valid_products) {
            this.state.cached_products = valid_products;
        }

        expand() {
            this.state.display_options = true;
        }

        collapse() {
            this.state.display_options = false;
        }

        // Events

        clickSelector() {
            if (this.state.active) {
                this.trigger("collapse-other-selectors");
                this.state.display_options = !this.state.display_options;
            }
        }

        clickOption(option) {
            this.state.selected_option = option;
            this.trigger("click-av-option", this.config.level);
            this.collapse();
        }

        spaceClickProduct(event) {
            if (event.which === 32) {
                this.trigger("click-product", this.props.product);
            }
        }
    }

    AttributeValueSelector.template = "AttributeValueSelector";
    Registries.Component.add(AttributeValueSelector);

    return {
        AttributeValueSelector: AttributeValueSelector,
    };
});
