/*
    Copyright 2015-Today GRAP (http://www.grap.coop)
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.devices", function(require) {
    "use strict";

    const devices = require("point_of_sale.devices");
    const CustomerDisplay_2_20 = require("pos_customer_display.CustomerDisplay_2_20");

    devices.ProxyDevice.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            // This property is used to temporarily disable the sending of messages
            // to the display.
            // As we're hooking into order changes to display events in the display,
            // we don't want them to be triggered when the order is initialized from
            // JSON, for example.
            this._customer_display_update = true;
        },
        loadCustomerDisplayFormatter: function() {
            // Prepare the customer display formatter
            if (this.pos.config.customer_display_format == "2_20") {
                this._customer_display_formatter = new CustomerDisplay_2_20(this.pos);
            } else {
                console.error(
                    "Unknown customer display format: " +
                        this.pos.config.customer_display_format
                );
            }
        },
        /**
         * @returns true if the display should be updated
         */
        shouldUpdateCustomerDisplay: function() {
            return (
                this.pos.config.iface_customer_display && this._customer_display_update
            );
        },
        /**
         * Calls a function with the customer display disabled.
         *
         * Similarily to how contextmanagers work on Python, this will disable
         * any calls to the display, and re-enable it when the function is done.
         *
         * As we're hooking into order changes to display events in the display,
         * we don't want them to be triggered when the order is initialized from
         * JSON, for example.
         *
         * @param {Function} fn         The function to call.
         * @param {Object} thisArg      `this` argument for the function.
         * @param {Array} argsArray     `arguments` array for the function.
         */
        withoutCustomerDisplayUpdate: function(fn, thisArg, argsArray) {
            const prevValue = this._customer_display_update;
            this._customer_display_update = false;
            const res = fn.apply(thisArg, argsArray);
            this._customer_display_update = prevValue;
            return res;
        },
        /**
         * Prints the text to the customer display.
         */
        sendToCustomerDisplay: function(message) {
            if (this.shouldUpdateCustomerDisplay()) {
                return this.message("send_text_customer_display", {
                    text_to_display: JSON.stringify(message),
                });
            }
        },
        /**
         * Prepares a message to be printed, using the configured display formatted.
         */
        prepareCustomerDisplayMessage: function(messageType, argsArray) {
            return this._customer_display_formatter.prepareMessage(
                messageType,
                argsArray
            );
        },
    });
});
