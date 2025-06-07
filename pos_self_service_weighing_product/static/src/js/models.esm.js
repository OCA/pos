/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {round_decimals, round_precision} from "web.utils";
import {BarcodeGenerator} from "@base_pos_self_service_weighing/js/models.esm";
import {Model} from "point_of_sale.Registries";
import {PosGlobalState} from "point_of_sale.models";

const SUPPORTED_BARCODE_RULE_TYPES = ["weight", "price", "price_to_weight"];

const SSWProductPosGlobalState = (PosGlobalState_) =>
    class extends PosGlobalState_ {
        init_barcode_generators() {
            super.init_barcode_generators();
            this.weight_price_barcode_rules = [];
            this.barcode_rule_to_generator = {};
            this.product_id_to_barcode_rule = {};
            this.product_id_to_barcode_generator = {};
            const rules = this.env.barcode_reader.barcode_parser.nomenclature.rules;
            for (const rule of rules) {
                if (SUPPORTED_BARCODE_RULE_TYPES.includes(rule.type)) {
                    this.weight_price_barcode_rules.push(rule);
                    this.barcode_rule_to_generator[rule.id] = new BarcodeGenerator(
                        this.env,
                        rule
                    );
                }
            }
            for (const [id, product] of Object.entries(this.env.pos.db.product_by_id)) {
                const rule = this._get_weight_price_barcode_rule(product);
                if (rule === null) {
                    continue;
                }
                this.product_id_to_barcode_rule[id] = rule;
                this.product_id_to_barcode_generator[id] =
                    this.barcode_rule_to_generator[rule.id];
            }
        }

        _get_weight_price_barcode_rule(product) {
            if (!product.to_weight || !product.barcode) {
                return null;
            }
            for (const rule of this.weight_price_barcode_rules) {
                const match = this.env.barcode_reader.barcode_parser.match_pattern(
                    product.barcode,
                    rule.pattern,
                    rule.encoding
                );
                if (match.match) {
                    return rule;
                }
            }
            return null;
        }

        filter_weight_price_barcode_product(product) {
            return this.product_id_to_barcode_generator[product.id] !== undefined;
        }

        generate_product_barcode(product, value) {
            const generator = this.product_id_to_barcode_generator[product.id];
            return generator.generate_barcode(value, product.barcode);
        }

        get_product_weight_string(product, weight) {
            const barcode_generator = this.product_id_to_barcode_generator[product.id];
            const product_uom = product.get_unit();
            return this.convert_and_format_uom_value(
                weight,
                this._kg_uom,
                product_uom,
                this.convert_uom_decimal_places(
                    barcode_generator.decimal_places,
                    this._kg_uom,
                    product_uom
                )
            );
        }

        get_product_price_string(product, weight, price) {
            const price_str = this.format_currency(price);
            const product_uom = product.get_unit();
            const weight_str = this.convert_and_format_uom_value(
                weight,
                this._kg_uom,
                product_uom
            );
            return `${price_str} (${weight_str})`;
        }

        get_current_pricelist() {
            const current_order = this.get_order();
            if (current_order) {
                return current_order.pricelist;
            }
            return this.default_pricelist;
        }

        _get_rounded_unit_price(product, quantity) {
            const pricelist = this.get_current_pricelist();
            const unit_price = product.get_price(pricelist, quantity);
            const digits = this.dp["Product Price"];
            return parseFloat(round_decimals(unit_price, digits).toFixed(digits));
        }

        _compute_display_price(product, rounded_unit_price, quantity) {
            // This comes from OrderLine.get_all_prices() with some changes
            // from Product.get_display_price().
            const order = this.get_order();
            const taxes_id = product.taxes_id.filter((t) => t in this.taxes_by_id);
            const taxes = this.get_taxes_after_fp(
                taxes_id,
                order && order.fiscal_position
            );
            const all_prices = this.compute_all(
                taxes,
                rounded_unit_price,
                quantity,
                this.currency.rounding
            );
            if (this.config.iface_tax_included === "total") {
                return all_prices.total_included;
            }
            return all_prices.total_excluded;
        }

        _get_product_prices(product, quantity) {
            const rounded_unit_price = this._get_rounded_unit_price(product, quantity);
            const price = round_precision(
                rounded_unit_price * quantity,
                this.currency.rounding
            );
            const display_price = this._compute_display_price(
                product,
                rounded_unit_price,
                quantity
            );
            return {price, display_price};
        }

        get_product_unit_display_price(product, quantity) {
            // Compute the unit price (with or without taxes, according to the
            // pos configuration).
            const rounded_unit_price = this._get_rounded_unit_price(product, quantity);
            return this._compute_display_price(product, rounded_unit_price, 1);
        }

        _get_rounded_weight(product, weight) {
            const product_uom = product.get_unit();
            const weight_in_product_uom = this.convert_uom_value(
                weight,
                this._kg_uom,
                product_uom
            );
            // This is done in the same way as in Orderline.set_quantity().
            const decimals = this.dp["Product Unit of Measure"];
            const rounding = Math.max(product_uom.rounding, Math.pow(10, -decimals));
            return round_precision(weight_in_product_uom, rounding);
        }

        compute_product_prices_from_weight(product, weight) {
            // Compute the prices (with and without taxes, according to the
            // pos configuration) in the same way as is done in the order
            // line. This is needed to ensure that the price that is computed
            // in the PoS from the barcode (weight or price without taxes) is
            // always equal to the price that is displayed on the scale screen
            // and on the barcode label.
            //
            // First, round the weight according to the uom rounding.
            const quantity = this._get_rounded_weight(product, weight);
            // Then, compute the prices from the (rounded) product unit price
            // and round them.
            return this._get_product_prices(product, quantity);
        }

        async print_product_barcode_label(product, weight) {
            let barcode_value = null;
            let value_string = null;
            const rule = this.product_id_to_barcode_rule[product.id];
            if (rule.type === "weight") {
                barcode_value = weight;
                value_string = this.get_product_weight_string(product, weight);
            } else {
                const {price, display_price} = this.compute_product_prices_from_weight(
                    product,
                    weight
                );
                barcode_value = price;
                value_string = this.get_product_price_string(
                    product,
                    weight,
                    display_price
                );
            }
            return this.print_barcode_label(
                product.display_name,
                this.generate_product_barcode(product, barcode_value),
                value_string
            );
        }
    };

Model.extend(PosGlobalState, SSWProductPosGlobalState);
