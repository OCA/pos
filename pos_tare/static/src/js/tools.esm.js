/** @odoo-module **/

import {round_decimals, round_precision} from "web.utils";
import {_t} from "web.core";
import {format} from "web.field_utils";

// Convert mass using the reference UOM as pivot unit.
export function convert_mass(mass, from_unit, to_unit) {
    // There is no conversion from one category to another.
    if (from_unit.category_id[0] !== to_unit.category_id[0]) {
        throw new Error(
            _.str.sprintf(
                _t("We cannot cast a weight in %s into %s."),
                from_unit.name,
                to_unit.name
            )
        );
    }
    // No need to convert as weights are measured in same unit.
    if (from_unit.id === to_unit.id) {
        return mass;
    }
    // Convert from "from_unit" to reference unit of measure.
    let result = mass;
    result /= from_unit.factor;
    // Convert from reference unit of measure to "to_unit".
    result *= to_unit.factor;

    if (to_unit.rounding) {
        // Return the rounded result if needed.
        return round_precision(result || 0, to_unit.rounding);
    }

    return result || 0;
}

// Format a quantity according to its UoM.
export function format_quantity(pos, qty, unit) {
    if (unit.rounding) {
        const q = round_precision(qty, unit.rounding);
        const decimals = pos.dp["Product Unit of Measure"];
        return format.float(round_decimals(q, decimals), {
            type: "float",
            digits: [69, decimals],
        });
    }
    return qty.toFixed(0);
}
