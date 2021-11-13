/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.Orderline", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const utils = require("web.utils");
    const round_di = utils.round_decimals;

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @returns the event.ticket object
         */
        get_event_ticket: function () {
            if (this.event_ticket_id) {
                return this.pos.db.get_event_ticket_by_id(this.event_ticket_id);
            }
        },

        /**
         * @returns the event object related to this line event.ticket
         */
        get_event: function () {
            if (this.event_ticket_id) {
                const ticket = this.get_event_ticket();
                return ticket.event_id;
            }
        },

        /**
         * @override
         */
        get_lst_price: function () {
            if (this.event_ticket_id) {
                return this.get_event_ticket().price;
            }
            return OrderlineSuper.get_lst_price.apply(this, arguments);
        },

        /**
         * @override
         */
        set_lst_price: function (price) {
            if (this.event_ticket_id) {
                this.order.assert_editable();
                this.get_event_ticket().price = round_di(
                    parseFloat(price) || 0,
                    this.pos.dp["Product Price"]
                );
            }
            return OrderlineSuper.set_lst_price.apply(this, arguments);
        },

        /**
         * Handle merging of lines with events.
         * We want to allow merging when tickets are the same.
         * We have to completely override this method in order for it to work,
         * to consider the event ticket prices because the core method works
         * only with product prices, and completely ignores price_manually_set.
         *
         * @override
         */
        can_be_merged_with: function (orderline) {
            if (this.event_ticket_id !== orderline.event_ticket_id) {
                return false;
            }
            if (this.event_ticket_id) {
                if (this.get_product().id !== orderline.get_product().id) {
                    return false;
                } else if (!this.get_unit() || !this.get_unit().is_pos_groupable) {
                    return false;
                } else if (this.get_discount() > 0) {
                    return false;
                } else if (
                    !utils.float_is_zero(
                        this.price - orderline.price,
                        this.pos.currency.decimals
                    )
                ) {
                    return false;
                } else if (this.product.tracking === "lot") {
                    return false;
                }
                return true;
            }
            return OrderlineSuper.can_be_merged_with.apply(this, arguments);
        },

        /**
         * @override
         */
        init_from_JSON: function (json) {
            OrderlineSuper.init_from_JSON.apply(this, arguments);
            this.event_ticket_id = json.event_ticket_id;
            // This line can be removed if https://github.com/odoo/odoo/pull/60462 gets merged
            this.price_manually_set = json.price_manually_set;
        },

        /**
         * @override
         */
        export_as_JSON: function () {
            const res = OrderlineSuper.export_as_JSON.apply(this, arguments);
            res.event_ticket_id = this.event_ticket_id;
            // This line can be removed if https://github.com/odoo/odoo/pull/60462 gets merged
            res.price_manually_set = this.price_manually_set;
            return res;
        },

        /**
         * @override
         */
        export_for_printing: function () {
            const res = OrderlineSuper.export_for_printing.apply(this, arguments);
            if (this.event_ticket_id) {
                res.event = this.get_event();
                res.event_ticket = this.get_event_ticket();
                res.product_name = _.str.sprintf(
                    "%s (%s)",
                    this.get_event().display_name,
                    this.get_event_ticket().name
                );
                res.product_name_wrapped = this._generate_wrapped_string(
                    res.product_name
                );
            }
            return res;
        },

        /**
         * Similar implementation to core method: generate_wrapped_product_name
         * However this one takes str and maxLength parameters
         *
         * @param {String} str
         * @param {Number} maxLength
         * @returns Array of truncated strings
         */
        _generate_wrapped_string: function (str, maxLength) {
            // 40 * line ratio of .6 = 24
            if (!maxLength) maxLength = 24;
            var wrapped = [];
            var current_line = "";
            while (str.length > 0) {
                var space_index = str.indexOf(" ");
                if (space_index === -1) {
                    space_index = str.length;
                }
                if (current_line.length + space_index > maxLength) {
                    if (current_line.length) {
                        wrapped.push(current_line);
                    }
                    current_line = "";
                }
                current_line += str.slice(0, space_index + 1);
                str = str.slice(space_index + 1);
            }
            if (current_line.length) {
                wrapped.push(current_line);
            }
            return wrapped;
        },
    });

    return models;
});
