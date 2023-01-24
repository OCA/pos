/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {Order, Orderline} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";
import field_utils from "web.field_utils";

// /////////////////////////////
// Overload models.Order
// /////////////////////////////

const OrderMargin = (Order) =>
    class extends Order {
        get_margin() {
            return this.get_orderlines().reduce(
                (margin, line) => margin + line.get_margin(),
                0
            );
        }

        get_margin_rate() {
            const priceWithoutTax = this.get_total_without_tax();
            return priceWithoutTax ? (this.get_margin() / priceWithoutTax) * 100 : 0;
        }

        get_margin_rate_str() {
            return field_utils.format.float(this.get_margin_rate()) + "%";
        }
    };

Registries.Model.extend(Order, OrderMargin);

// /////////////////////////////
// Overload models.OrderLine
// /////////////////////////////
const OrderLineMargin = (Orderline) =>
    class extends Orderline {
        get_purchase_price() {
            // Overload the function to use another field that the default standard_price
            return this.product.standard_price;
        }

        get_margin() {
            return (
                this.get_all_prices().priceWithoutTax -
                this.quantity * this.get_purchase_price()
            );
        }

        get_margin_rate() {
            const priceWithoutTax = this.get_all_prices().priceWithoutTax;
            return priceWithoutTax ? (this.get_margin() / priceWithoutTax) * 100 : 0;
        }

        get_margin_rate_str() {
            return field_utils.format.float(this.get_margin_rate()) + "%";
        }
    };

Registries.Model.extend(Orderline, OrderLineMargin);
