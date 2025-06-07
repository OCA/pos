/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {BarcodeGenerator} from "@base_pos_self_service_weighing/js/models.esm";
import {Model} from "point_of_sale.Registries";
import {PosGlobalState} from "point_of_sale.models";

const TARE_BARCODE_RULE_TYPE = "tare";

const SSWTarePosGlobalState = (PosGlobalState_) =>
    class extends PosGlobalState_ {
        init_barcode_generators() {
            super.init_barcode_generators();
            const tare_barcode_rule =
                this.env.pos.find_barcode_rule_by_type(TARE_BARCODE_RULE_TYPE);
            this.tare_barcode_generator = new BarcodeGenerator(
                this.env,
                tare_barcode_rule
            );
            this._tare_uom = this.units_by_id[this.tare_uom_id];
            this._tare_decimal_places = this.convert_uom_decimal_places(
                this.tare_barcode_decimal_places,
                this.tare_barcode_uom,
                this._tare_uom
            );
        }

        generate_tare_barcode(weight) {
            return this.tare_barcode_generator.generate_barcode(weight);
        }

        get_tare_weight_string(weight) {
            return this.convert_and_format_uom_value(
                weight,
                this._kg_uom,
                this.tare_uom,
                this.tare_decimal_places
            );
        }

        get tare_barcode_decimal_places() {
            // Return the number of decimal places of the weight of the tare
            // barcode.
            return this.tare_barcode_generator.decimal_places;
        }

        get tare_barcode_uom() {
            // Return the uom of the weight of the tare barcode. Consider that
            // the value in weight barcodes represents kilograms. Hardcode
            // this until there is a way to configure this. This code also
            // assumes that the weight passed to .generate_barcode() is in
            // kilograms.
            return this._kg_uom;
        }

        get tare_uom() {
            return this._tare_uom;
        }

        get tare_uom_id() {
            return this.config.iface_tare_uom_id[0];
        }

        get tare_decimal_places() {
            // Number of decimals to display in the tare_uom_id depending on
            // the precision of the tare barcode.
            return this._tare_decimal_places;
        }

        async print_tare_barcode_label(weight) {
            return this.print_barcode_label(
                this.env._t("Tare"),
                this.generate_tare_barcode(weight),
                this.get_tare_weight_string(weight)
            );
        }
    };

Model.extend(PosGlobalState, SSWTarePosGlobalState);
