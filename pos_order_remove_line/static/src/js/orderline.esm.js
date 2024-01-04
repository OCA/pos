/** @odoo-module **/
/*
 *  Copyright 2023 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

import Orderline from "point_of_sale.Orderline";
import Registries from "point_of_sale.Registries";

const PosOrderline = (Orderline) =>
    class extends Orderline {
        async removeLine(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.props.line.set_quantity("remove", null);
        }
    };
Registries.Component.extend(Orderline, PosOrderline);
