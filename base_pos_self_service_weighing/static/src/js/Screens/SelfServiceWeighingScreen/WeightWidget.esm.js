/** @odoo-module alias=base_pos_self_service_weighing.WeightWidget **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

class WeightWidget extends PosComponent {
    setup() {
        super.setup(...arguments);
        // Assume that this.props.weight always represents kilograms.
        this._kg_uom = this.env.pos.find_uom_by_name("kg");
        if (this.props.uom_id) {
            this.uom = this.env.pos.units_by_id[this.props.uom_id];
        } else {
            this.uom = this._kg_uom;
        }
    }

    get weightString() {
        // When this.props.decimal_places is undefined, this function uses the
        // precision of this.uom.
        return this.env.pos.convert_and_format_uom_value(
            this.props.weight,
            this._kg_uom,
            this.uom,
            this.props.decimal_places
        );
    }
}

WeightWidget.template = "WeightWidget";
Registries.Component.add(WeightWidget);
export default WeightWidget;
