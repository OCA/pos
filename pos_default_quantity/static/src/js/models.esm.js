/** @odoo-module alias=pos_default_quantity.models **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Orderline} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const DefaultQtyOrderline = (Orderline) =>
    class DefaultQtyOrderline extends Orderline {
        constructor(obj, options) {
            super(obj, options);

            // Don't set default quantity on restored lines
            if (options.json) {
                return;
            }

            if (this.pos.config.set_default_product_quantity) {
                this.set_quantity(this.product.pos_default_qty);
            }
        }
    };

Registries.Model.extend(Orderline, DefaultQtyOrderline);
export default DefaultQtyOrderline;
