/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.screens", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");

    screens.AddEventButton = screens.ActionButtonWidget.extend({
        template: "AddEventButton",
        button_click: function() {
            this.gui.show_popup("event-selector", {title: "Events"});
        },
    });

    screens.define_action_button({
        name: "add_event_button",
        widget: screens.AddEventButton,
        condition: function() {
            return this.pos.config.iface_event_sale;
        },
    });

    screens.ProductScreenWidget.include({
        /**
         * @override
         */
        click_product: function(product) {
            if (this.pos.config.iface_event_sale && product.event_ok === true) {
                return this.gui.show_popup("event-selector", {
                    title: product.display_name,
                    product: product,
                });
            }
            return this._super.apply(this, arguments);
        },
    });

    screens.ActionpadWidget.include({
        /**
         * @override
         */
        renderElement: function() {
            this._super.apply(this, arguments);
            // Get original event handlers to call AFTER our added code
            // We do it like this to avoid overwriting the event handler
            // so that our code plays nice with other modules
            const $pay = this.$(".pay");
            const originalHandlers = $._data($pay.get(0), "events").click.map(
                ev => ev.handler
            );
            const originalHandlersFn = function() {
                for (const handler of originalHandlers) {
                    handler.apply(this, arguments);
                }
            };
            // Update and check order events availability before
            // going to the payment screen. Prevent paying if error.
            $pay.unbind("click").click(() => {
                this.pos
                    .get_order()
                    .updateAndCheckEventAvailability()
                    .then(() => originalHandlersFn.apply(this, arguments))
                    .catch(error => {
                        console.error(error.exception || error);
                        this.pos.gui.show_popup("error", {
                            title: error.title,
                            body: error.message,
                        });
                    });
            });
        },
    });

    return screens;
});
