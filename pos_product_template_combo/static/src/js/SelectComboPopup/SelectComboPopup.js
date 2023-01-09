odoo.define("pos_product_template_combo.SelectComboPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const utils = require("web.utils");
    const {useState} = owl.hooks;

    class SelectComboPopup extends AbstractAwaitablePopup {
        constructor(parent, props) {
            super(parent, props);

            const product = props.product;
            const combo_categories = this.env.pos.db
                .get_product_combo_categories_by_ids(
                    product.product_tmpl_combo_category_ids
                )
                .sort(function (a, b) {
                    return a.sequence - b.sequence;
                });

            this.state = useState({
                product: product,
                combo_categories: combo_categories,
                error_msg: "",
            });
        }

        async confirm_combo() {
            const categories_controllers = Object.values(this.__owl__.children);
            if (this._validate_selected_options(categories_controllers)) {
                this.confirm();
            }
        }

        async getPayload() {
            const categories_controllers = Object.values(this.__owl__.children);
            return this._mount_products_to_add_map(categories_controllers);
        }

        _validate_selected_options(categories_controllers) {
            const invalid_categories = [];
            categories_controllers.forEach((category) => {
                if (category.state.selected_qty !== null) {
                    const selecetd_qty_list = Object.values(
                        category.state.selected_qty
                    );
                    const total_qty = selecetd_qty_list.reduce(
                        (partialSum, value) => partialSum + value,
                        0
                    );

                    if (
                        category.state.categoryBehavior === "default" &&
                        total_qty !== category.state.max_qty
                    ) {
                        invalid_categories.push(category.state.name);
                    }
                } else if (category.state.selected_option === null) {
                    invalid_categories.push(category.state.name);
                }
            });

            if (invalid_categories.length !== 0) {
                this._show_error_msg(invalid_categories);
                return false;
            }

            return true;
        }

        _show_error_msg(invalid_categories) {
            let message = this.env._t("Invalid values selected for categories: ");
            message += invalid_categories.join(", ");
            this.state.error_msg = this.env._t(message);
        }

        /**
         * Assembles the object of the products chosen by the user and their respective price and quantity information.
         * If the product.template associated with the combo category has more than one product,
         * the field is filled with "false" and the user will be asked later in the flow using "SelectVariantPopup".
         * @param {Object} category_contollers The state of the choices of each category of the combo
         * @returns {Object} Product information to be added to the order
         */
        _mount_products_to_add_map(category_contollers) {
            let products_to_add = [];
            category_contollers.forEach((category) => {
                if (
                    category.state.max_qty > 1 &&
                    category.state.categoryBehavior === "default"
                ) {
                    const temp_products_to_add = [];

                    Object.entries(category.state.selected_qty).forEach(
                        ([option_id, qty]) => {
                            if (qty === 0) return;

                            const option = this.env.pos.db.get_product_combo_category_options_by_ids(
                                [option_id]
                            )[0];
                            const product = this.env.pos.db.get_product_by_template_id(
                                option.product_template_id[0]
                            );

                            temp_products_to_add.push({
                                product: product,
                                quantity: qty,
                                price: this._compute_price(category, product),
                                template_id: option.product_template_id[0],
                                categoryBehavior: category.state.categoryBehavior,
                            });
                        }
                    );

                    this._compute_price_apportionment(
                        category.state.price,
                        temp_products_to_add
                    );
                    products_to_add = products_to_add.concat(temp_products_to_add);
                } else {
                    const selected_option = category.state.selected_option;
                    const product = this.env.pos.db.get_product_by_template_id(
                        selected_option.product_template_id[0]
                    );

                    products_to_add.push({
                        product: product,
                        quantity: 1,
                        quantityToAdd: category.state.max_qty,
                        price: this._compute_price(category, product),
                        template_id: selected_option.product_template_id[0],
                        categoryBehavior: category.state.categoryBehavior,
                    });
                }
            });
            return products_to_add;
        }

        /**
         * If the combo category price is set to zero, the chosen product price is
         * used to calculate the order line price. For categories associated with
         * product.templates with more than one product, the price will be corrected
         * after the user chooses the product with the "SelectVariantPopup".
         * @param {Object} category State of combo category choices
         * @param {Object} product Product associated with the user's choice
         * @returns {Number} Order line price related to choice
         */
        _compute_price(category, product) {
            let price = category.state.price;

            if (category.state.categoryBehavior === "duplicate_item") {
                price -= 0.01 * category.state.max_qty;
            } else if (price === 0 && product) {
                price = product.lst_price;
            } else {
                price /= category.state.max_qty;
            }

            return utils.round_precision(price, 0.01);
        }

        /**
         * Calculate the price apportionment of the combo category between the chosen options.
         * Possible price differences are added to the product of the first order line.
         * @param {Float} category_price Combo category price
         * @param {Object} temp_products_to_add chosen options
         */
        _compute_price_apportionment(category_price, temp_products_to_add) {
            // If the category price is zeroed, the price of the chosen product
            // will be used and it is not necessary to apportion.
            if (category_price === 0) {
                return;
            }

            const total_price = temp_products_to_add.reduce(
                (partialSum, value) => partialSum + value.price * value.quantity,
                0
            );

            const price_difference = utils.round_precision(
                category_price - total_price,
                0.01
            );

            // The apportionment difference must be placed on a line with only one amount,
            // to avoid rounding problems
            if (temp_products_to_add[0].quantity > 1) {
                temp_products_to_add[0].quantity--;

                const temp = Object.assign({}, temp_products_to_add[0]);
                temp.quantity = 1;

                temp_products_to_add.unshift(temp);
            }

            temp_products_to_add[0].price += price_difference;
        }
    }
    SelectComboPopup.template = "SelectComboPopup";
    SelectComboPopup.defaultProps = {
        confirmText: "Ok",
        cancelText: "Cancel",
        body: "",
    };

    Registries.Component.add(SelectComboPopup);
    return SelectComboPopup;
});
