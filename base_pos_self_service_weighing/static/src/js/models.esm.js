/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {round_decimals, round_precision} from "web.utils";
import {Gui} from "point_of_sale.Gui";
import {Model} from "point_of_sale.Registries";
import {PosGlobalState} from "point_of_sale.models";
import {format} from "web.field_utils";

const VALUE_PLACEHOLDER_REGEX = /{(N*D*)}/;
const DECIMAL_PLACES_REGEX = /D*$/;

export class BarcodeGenerator {
    constructor(env, barcode_rule) {
        this.env = env;
        const barcode_pattern = barcode_rule.pattern;
        const placeholder_match = barcode_pattern.match(VALUE_PLACEHOLDER_REGEX);
        this.value_placeholder_index = placeholder_match.index;
        const value_placeholder = placeholder_match[1];
        this.num_digits = value_placeholder.length;
        this.decimal_places = value_placeholder.match(DECIMAL_PLACES_REGEX)[0].length;
        // Replace "." in pattern by 0 and add a placeholder checksum digit.
        this._barcode_pattern = barcode_pattern.replaceAll(".", "0") + "0";
    }

    generate_barcode(value, product_barcode) {
        // Generate a barcode from the provided value. The value is a floating
        // point number that will be rounded according to the available
        // decimal places.

        // Convert the value to an integer, taking decimal_places into
        // account.
        if (value < 0) {
            throw new Error(this.env._t("Barcode value must be positive"));
        }
        const int_value = round_precision(value * Math.pow(10, this.decimal_places), 1);
        if (int_value >= Math.pow(10, this.num_digits)) {
            const max_value = (
                (Math.pow(10, this.num_digits) - 1) /
                Math.pow(10, this.decimal_places)
            ).toFixed(this.decimal_places);
            throw new RangeError(this.env._t(`Maximum value is ${max_value}`));
        }
        // Pad with zeroes.
        const padded_value = ("0".repeat(this.num_digits) + int_value).substr(
            -this.num_digits
        );
        let barcode = null;
        if (product_barcode) {
            // Replace the placeholder digits of the product barcode by the
            // value.
            barcode =
                product_barcode.slice(0, this.value_placeholder_index) +
                padded_value +
                product_barcode.slice(this.value_placeholder_index + this.num_digits);
        } else {
            // Build the barcode from the barcode rule pattern (with a
            // placeholder checksum).
            barcode = this._barcode_pattern.replace(
                VALUE_PLACEHOLDER_REGEX,
                padded_value
            );
        }
        // Compute the checksum and return the result.
        return this.env.barcode_reader.barcode_parser.sanitize_ean(barcode);
    }
}

const SelfServiceWeighingPosGlobalState = (PosGlobalState_) =>
    class extends PosGlobalState_ {
        find_uom_by_name(name) {
            for (const uom of this.units) {
                if (uom.name === name) {
                    return uom;
                }
            }
            throw new Error(this.env._t(`No UoM of name "${name}" found`));
        }

        find_barcode_rule_by_type(type) {
            const rules = this.env.barcode_reader.barcode_parser.nomenclature.rules;
            for (const rule of rules) {
                // We select the first (smallest sequence ID) barcode rule with
                // the expected type.
                if (rule.type === type) {
                    return rule;
                }
            }
            throw new Error(this.env._t(`No barcode rule of type "${type}" found`));
        }

        async print_barcode_label(title, barcode, value_str) {
            return Gui.showPopup("ErrorPopup", {
                title: this.env._t("Print Barcode Label"),
                body: this.env._t(
                    `Please install a pos_self_service_weighing_print_* ` +
                        `module to print the label.\n\n` +
                        `Title: ${title}\n` +
                        `Barcode: ${barcode}\n` +
                        `Value: ${value_str}`
                ),
            });
        }

        // This method should be overridden by modules depending on this. The
        // overriding methods should call super.init_barcode_generators().
        init_barcode_generators() {
            this._kg_uom = this.find_uom_by_name("kg");
        }

        convert_uom_value(value, from_uom, to_uom) {
            if (to_uom.id === from_uom.id) {
                return value;
            }
            if (from_uom.category_id[0] !== to_uom.category_id[0]) {
                throw new Error(
                    this.env._t(
                        `Cannot convert a value from ${from_uom.name} to ` +
                            `${to_uom.name}`
                    )
                );
            }
            let converted_value = value;
            converted_value /= from_uom.factor;
            converted_value *= to_uom.factor;
            return converted_value;
        }

        format_uom_value(value, uom, decimal_places) {
            let formatted_value = value;
            if (decimal_places === undefined) {
                // This comes from point_of_sale/static/src/js/models.js:1863
                if (uom.rounding) {
                    const decimals = this.dp["Product Unit of Measure"];
                    const rounding = Math.max(uom.rounding, Math.pow(10, -decimals));
                    formatted_value = round_precision(formatted_value, rounding);
                    formatted_value = format.float(formatted_value, {
                        digits: [69, decimals],
                    });
                } else {
                    formatted_value = round_precision(formatted_value, 1);
                    formatted_value = this.quantity.toFixed(0);
                }
            } else {
                formatted_value = round_decimals(formatted_value, decimal_places);
                formatted_value = format.float(formatted_value, null, {
                    digits: [null, Math.max(0, decimal_places)],
                });
            }
            return formatted_value + " " + uom.name;
        }

        convert_and_format_uom_value(value, from_uom, to_uom, decimal_places) {
            return this.format_uom_value(
                this.convert_uom_value(value, from_uom, to_uom),
                to_uom,
                decimal_places
            );
        }

        convert_uom_decimal_places(decimal_places, from_uom, to_uom) {
            if (from_uom.id === to_uom.id) {
                return decimal_places;
            }
            const precision = Math.pow(10, -decimal_places);
            const converted_precision = this.convert_uom_value(
                precision,
                from_uom,
                to_uom
            );
            return Math.round(Math.log(1 / converted_precision) / Math.log(10));
        }
    };

Model.extend(PosGlobalState, SelfServiceWeighingPosGlobalState);
