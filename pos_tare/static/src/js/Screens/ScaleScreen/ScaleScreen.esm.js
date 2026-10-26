/** @odoo-module **/

import {onMounted, useState} from "@odoo/owl";
import {Component} from "point_of_sale.Registries";
import ScaleScreen from "point_of_sale.ScaleScreen";
import {convert_mass} from "../../tools.esm";
import {round_precision} from "web.utils";
import {useBarcodeReader} from "point_of_sale.custom_hooks";

const TareScaleScreen = (ScaleScreen_) =>
    class extends ScaleScreen_ {
        setup() {
            super.setup();
            this.decimalPoint = this.env._t.database.parameters.decimal_point;
            this.state = useState({
                tare_str: this.props.product.tare_weight
                    ? this._formatFloatValue(this.props.product.tare_weight)
                    : "",
                tare: this.props.product.tare_weight || 0,
                tare_in_product_uom: this.props.product.tare_weight || 0,
                tare_input_valid: true,
                tare_rounded_str: null,
                weight: 0,
                gross_weight_str: "",
                gross_weight: 0,
                gross_weight_input_valid: true,
            });
            this.updateWeight();
            if (this.env.pos.config.iface_tare_method !== "manual") {
                useBarcodeReader({
                    tare: this._barcodeTareAction,
                });
                // Don't focus fields if the tare can be input with a barcode
                // reader, as scanning the barcode would result in its value
                // being input in the field (as barcode readers are seen as
                // keyboards).
                return;
            }
            let selector = "#input_weight_tare";
            if (this.env.pos.config.iface_gross_weight_method === "manual") {
                selector = "#input_gross_weight";
            }
            onMounted(() => {
                const target = this.el.querySelectorAll(selector)[0];
                target.focus();
                target.selectionStart = 0;
                target.selectionEnd = target.value.length;
            });
        }

        get gross_uom() {
            return this.env.pos.units_by_id[this.props.product.uom_id[0]];
        }

        get has_tare() {
            return this.state.tare > 0;
        }

        get tare_rounding_enabled() {
            return this.env.pos.config.iface_tare_scale_precision > 0;
        }

        get tare_is_rounded() {
            return this.state.tare_rounded_str !== null;
        }

        async _barcodeTareAction(code) {
            this.state.tare_str = this._formatFloatValue(code.value);
        }

        _readScale() {
            if (this.env.pos.config.iface_gross_weight_method === "scale") {
                super._readScale();
            }
        }

        async _setWeight() {
            if (this.has_tare && this.env.pos.config.iface_send_tare_to_scale) {
                this.env.proxy.scale_read_tare_param = this.state.tare_in_product_uom;
            } else {
                this.env.proxy.scale_read_tare_param = null;
            }
            await super._setWeight();

            // If no scale is connected, the returned weight can be undefined.
            // Default to 0 to avoid errors down the line.
            this.state.gross_weight = this.state.weight || 0;
            // This is necessary to display the weight in the UI. It is not a
            // string value in this case, which ensures that it won't be
            // converted.
            this.state.gross_weight_str = this.state.gross_weight;
            try {
                this._computeWeight();
            } catch (error) {
                // Log the error to the console instead of displaying a pop-up
                // over and over.
                console.error(
                    this.env._t("Error Computing Weight") + ": " + error.message
                );
            }
        }

        updateWeight() {
            try {
                this._computeWeight();
            } catch (error) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Error Computing Weight"),
                    body: error.message,
                });
            }
            if (
                this.env.pos.config.iface_gross_weight_method === "manual" &&
                this.state.tare <= 0 &&
                this.state.gross_weight_input_valid
            ) {
                // If the weight input method is manual and no tare is set,
                // the weight will not be set (because _setWeight() is not
                // called, and the weight is not computed in _computeWeight()
                // when no tare is set to avoid a possible error). Therefore
                // it needs to be set here.
                this.state.weight = this.state.gross_weight;
            }
        }

        _parseFloatValue(value) {
            // Similar code as in Orderline.set_quantity(), to correctly
            // handle different decimal separators and values that have
            // already be converted from string to number.
            if (typeof value === "number") {
                return value;
            }
            // We don't use field_utils.parse.float() because we don't want to
            // support thousands separators. There are locales where the
            // thousands separator is a dot, and we want the user to be able
            // to use the dot in addition to the locale's decimal separator.
            return Number(value.replace(this.decimalPoint, "."));
        }

        _formatFloatValue(value) {
            return String(value).replace(".", this.decimalPoint);
        }

        _computeWeight() {
            this.state.gross_weight = this._parseFloatValue(
                this.state.gross_weight_str
            );
            this.state.gross_weight_input_valid = !isNaN(this.state.gross_weight);
            this.state.tare = this._parseFloatValue(this.state.tare_str);
            this.state.tare_input_valid = !isNaN(this.state.tare);
            // Set the default value here, as this is the most common case,
            // and it indicates that the tare value has not been rounded.
            this.state.tare_rounded_str = null;
            if (!this.state.gross_weight_input_valid || !this.state.tare_input_valid) {
                // This is to ensure that the resulting weight is invalid.
                // Without this, if the tare uom and the product uom are
                // different, convert_mass() returns 0, which results in a
                // valid weight, while it should not.
                this.state.weight = NaN;
                return;
            }
            if (this.has_tare) {
                // We compute this only if a tare is set to avoid an error in
                // case the UoM categories don't match. Odoo's default
                // behavior is to consider that the value returned by the
                // scale is in the same UoM as the product.
                const tare_uom_id = this.env.pos.config.iface_tare_uom_id[0];
                const tare_uom = this.env.pos.units_by_id[tare_uom_id];
                if (this.tare_rounding_enabled) {
                    let rounded_tare = round_precision(
                        this.state.tare,
                        this.env.pos.config.iface_tare_scale_precision
                    );
                    // This is a hack to work around the problems with
                    // round_precision(), where round_precision(0.018, 0.001)
                    // gives 0.018000000000000002.
                    rounded_tare = round_precision(rounded_tare * 1000000) / 1000000;
                    if (this.state.tare !== rounded_tare) {
                        this.state.tare = rounded_tare;
                        // Don't modify tare_str because this would conflict
                        // with the user input.
                        this.state.tare_rounded_str = this._formatFloatValue(
                            this.state.tare
                        );
                    }
                }
                // This will throw an exception if the UoM categories don't match.
                this.state.tare_in_product_uom = convert_mass(
                    this.state.tare,
                    tare_uom,
                    this.gross_uom
                );
                this.state.weight =
                    this.state.gross_weight - this.state.tare_in_product_uom;
            }
        }

        confirm() {
            // Override the parent method to define the weight as an object
            // containing the tare.
            this.props.resolve({
                confirmed: true,
                payload: {
                    weight: {
                        weight: this.state.weight,
                        tare: this.state.tare,
                    },
                },
            });
            this.trigger("close-temp-screen");
        }
    };

Component.extend(ScaleScreen, TareScaleScreen);

export default ScaleScreen;
