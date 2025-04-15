/** @odoo-module **/
// Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
// @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {Order, Orderline} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

// /////////////////////////////
// Overload models.Order
// /////////////////////////////
patch(Order.prototype, {
    get_margin() {
        return this.get_orderlines().reduce(
            (margin, line) => margin + line.get_margin(),
            0
        );
    },
    get_margin_rate() {
        const priceWithoutTax = this.get_total_without_tax();
        return priceWithoutTax ? (this.get_margin() / priceWithoutTax) * 100 : 0;
    },

    get_margin_rate_str() {
        return this.env.utils.roundCurrency(this.get_margin_rate()) + "%";
    },
});

// /////////////////////////////
// Overload models.OrderLine
// /////////////////////////////
patch(Orderline.prototype, {
    setup() {
        super.setup(...arguments);
        console.log(this.pos);
    },
    getDisplayData() {
        return {
            ...super.getDisplayData(),
            ifaceDisplayMargin: this.get_iface_display_margin(),
            margin_rate: this.get_margin_rate(),
            margin_rate_str: this.get_margin_rate_str(),
        };
    },
    get_iface_display_margin() {
        return this.pos.config.iface_display_margin;
    },
    get_purchase_price() {
        // Overload the function to use another field that the default standard_price
        return this.product.standard_price;
    },
    get_margin() {
        return (
            this.get_all_prices().priceWithoutTax -
            this.quantity * this.get_purchase_price()
        );
    },
    get_margin_rate() {
        const priceWithoutTax = this.get_all_prices().priceWithoutTax;
        return priceWithoutTax ? (this.get_margin() / priceWithoutTax) * 100 : 0;
    },
    get_margin_rate_str() {
        return this.env.utils.roundCurrency(this.get_margin_rate()) + "%";
    },
});
