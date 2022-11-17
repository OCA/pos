odoo.define("pos_product_template_combo.ComboCategoryController", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    class ComboCategoryController extends PosComponent {
        constructor(parent, props) {
            super(parent, props);

            const category = props.category;
            const options = this._get_combo_options_by_category(category);
            const selected_qty = this._mount_selected_qty(options, category.max_qty);

            useListener("change-option-qty", this._change_option_qty);

            this.state = useState({
                name: category.name,
                options: options,
                max_qty: category.max_qty,
                selected_option: null,
                selected_qty: selected_qty,
                price: category.price,
            });

            // If it only has one option, it should already be checked by default.
            if (options.length === 1) {
                this._on_selected_option(options[0]);
            }
        }

        _get_combo_options_by_category(category) {
            const options_ids = category.product_tmpl_combo_category_option_ids;
            return this.env.pos.db.get_product_combo_category_options_by_ids(
                options_ids
            );
        }

        _mount_selected_qty(options, max_qty) {
            const selected_qty = {};
            if (max_qty === 1) {
                return null;
            }
            options.forEach((option) => {
                selected_qty[option.id] = 0;
            });
            return selected_qty;
        }

        _update_selected_qty() {
            const options = Object.values(this.__owl__.children);
            options.forEach((o) => {
                const object = o.props.option;
                this.state.selected_qty[object.id] = o.props.quanity;
            });
        }

        _change_option_qty(event) {
            const operation = event.detail.operation;
            const option = event.detail.option;

            const selecetd_qty_list = Object.values(this.state.selected_qty);
            const total_qty = selecetd_qty_list.reduce(
                (partialSum, value) => partialSum + value,
                0
            );

            if (operation === "increase") {
                if (total_qty + 1 > this.state.max_qty) {
                    return;
                }
                this.state.selected_qty[option.id]++;
            }
            if (operation === "decrease") {
                if (this.state.selected_qty[option.id] > 0) {
                    this.state.selected_qty[option.id]--;
                }
            }
        }

        _on_selected_option(option) {
            this.state.selected_option = option;
        }
    }
    ComboCategoryController.template = "ComboCategoryController";

    Registries.Component.add(ComboCategoryController);
    return ComboCategoryController;
});
