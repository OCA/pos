/*
    Copyright 2015-Today GRAP (http://www.grap.coop)
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.AbstractDisplayFormatter", function(require) {
    "use strict";

    const core = require("web.core");

    const AbstractDisplayFormatter = core.Class.extend({
        init: function(parent) {
            this.pos = parent;
        },
        prepareLine: function(left_part, right_part) {
            left_part = left_part === false ? "" : left_part;
            right_part = right_part === false ? "" : right_part;
            const line_length = this.pos.config.customer_display_line_length;
            let max_left_length = line_length;
            if (right_part.length !== 0) {
                max_left_length -= right_part.length;
            }
            let result = left_part.substring(0, max_left_length - 1);
            result = result.padEnd(max_left_length);
            if (right_part.length !== 0) {
                result += right_part.padStart(line_length - result.length);
            }
            return result;
        },
        prepareMessage: function(messageType, argsArray) {
            return this[`prepareMessage_${messageType}`].apply(this, argsArray);
        },
        prepareMessage_welcome: function() {
            console.error("Not implemented");
        },
        prepareMessage_close: function() {
            console.error("Not implemented");
        },
        prepareMessage_orderline: function(orderLine, action) {
            console.error("Not implemented", orderLine, action);
        },
        prepareMessage_payment: function() {
            console.error("Not implemented");
        },
        prepareMessage_client: function() {
            console.error("Not implemented");
        },
    });

    return AbstractDisplayFormatter;
});
