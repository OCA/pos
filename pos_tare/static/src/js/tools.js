odoo.define('pos_tare.tools', function (require) {

    "use strict";
    var core = require('web.core');
    var utils = require('web.utils');
    var field_utils = require('web.field_utils');

    var _t = core._t;
    var round_pr = utils.round_precision;
    var round_di = utils.round_decimals;

    // Convert mass using the reference UOM as pivot unit.
    var convert_mass = function (mass, from_unit, to_unit) {
        // There is no conversion from one category to another.
        if (from_unit.category_id[0] !== to_unit.category_id[0]) {
            throw new Error(_.str.sprintf(
                _t("We can not cast a weight in %s into %s."),
                from_unit.name, to_unit.name));
        }
        // No need to convert as weights are measured in same unit.
        if (from_unit.id === to_unit.id) {
            return mass;
        }
        // Converts "from_unit" to reference unit of measure.
        var result = mass;
        if (from_unit.uom_type === "bigger") {
            result /= from_unit.factor;
        } else {
            result *= from_unit.factor_inv;
        }
        // Converts reference unit of measure to "to_unit".
        if (to_unit.uom_type === "bigger") {
            result *= to_unit.factor;
        } else {
            result /= to_unit.factor_inv;
        }

        if (to_unit.rounding) {
            // Return the rounded result if needed.
            return round_pr(result || 0, to_unit.rounding);
        }

        return result || 0;
    };

    // Format the tare value.
    var format_tare = function (pos, qty, unit) {
        if (unit.rounding) {
            var q = round_pr(qty, unit.rounding);
            var decimals = pos.dp['Product Unit of Measure'];
            return field_utils.format.float(
                round_di(q, decimals),
                {type: 'float', digits: [69, decimals]});
        }
        return qty.toFixed(0);
    };

    return {
        convert_mass: convert_mass,
        format_tare: format_tare,
    };
});
