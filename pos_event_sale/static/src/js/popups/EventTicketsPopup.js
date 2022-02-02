/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.EventTicketsPopup", function(require) {
    "use strict";

    const PopupWidget = require("point_of_sale.popups");
    const gui = require("point_of_sale.gui");
    const core = require("web.core");
    const QWeb = core.qweb;

    const EventTicketsPopup = PopupWidget.extend({
        template: "EventTicketsPopup",
        events: _.extend({}, PopupWidget.prototype.events, {
            "click article.ticket:not(.disabled)": "click_ticket",
        }),

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this.tickets = [];
        },

        /**
         * @override
         */
        show: function(options) {
            this.tickets = [];
            if (options.event) {
                this.tickets = options.event.event_ticket_ids;
            }
            return this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        renderElement: function() {
            this._super.apply(this, arguments);
            if (this.tickets.length) {
                this.renderTickets();
            }
        },

        getProductImageURL: function(product_id) {
            return (
                window.location.origin +
                "/web/image?model=product.product&field=image_128&id=" +
                product_id
            );
        },

        getTicketFinalPrice: function(ticket) {
            const pricelist = _.findWhere(self.posmodel.pricelists, {
                name: this.pos.get_order().pricelist.name,
            });
            const product = this.pos.db.get_product_by_id(ticket.product_id[0]);
            // When we sell events in pos, sales price is set at the ticket level and not in the product.
            // We set product.lst_price with the price of the ticket. Like that, standard method get_price
            // will be able to apply the discount on the top of ticket price.
            // See get_price method: https://github.com/odoo/odoo/blob/44f7754af4fc82228f4f12d3f0b59a2cfe7ecab5/addons/point_of_sale/static/src/js/models.js#L1543
            product.lst_price = ticket.price;
            return product.get_price(pricelist, 1);
        },

        renderTickets: function() {
            const $ticketsList = this.$(".product-list");
            $ticketsList.empty();
            for (const ticket of this.tickets) {
                $ticketsList.append(
                    QWeb.render("EventTicketListItem", {
                        widget: this,
                        ticket: ticket,
                        product: this.pos.db.get_product_by_id(ticket.product_id[0]),
                        ticket_final_price: this.getTicketFinalPrice(ticket),
                        image_url: this.getProductImageURL(ticket.product_id[0]),
                        seats_available: this.pos.getEventTicketSeatsAvailable(ticket),
                    })
                );
            }
        },

        click_ticket: function(ev) {
            const $el = $(ev.currentTarget);
            const ticket_id = $el.data("id");
            const ticket = this.pos.db.get_event_ticket_by_id(ticket_id);
            const product = this.pos.db.get_product_by_id(ticket.product_id[0]);
            const ticket_final_price = this.getTicketFinalPrice(ticket);
            this.pos.get_order().add_product(product, {
                quantity: 1,
                price: ticket_final_price,
                extras: {
                    event_ticket_id: ticket.id,
                    price_manually_set: true,
                },
            });
            // Render tickets, to update availabilities
            this.renderTickets();
        },
    });

    gui.define_popup({name: "event-tickets", widget: EventTicketsPopup});

    return EventTicketsPopup;
});
