/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventTicketsPopup", function (require) {
    "use strict";

    const {useListener} = require("@web/core/utils/hooks");
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    class EventTicketsPopup extends AbstractAwaitablePopup {
        /**
         * @param {Object} props
         * @param {Object} props.event
         */
        setup() {
            super.setup();
            useListener("click-event-ticket", this._clickEventTicket);
        }
        get title() {
            return this.props.event.name;
        }
        get eventTicketsToDisplay() {
            return this.props.event.getEventTickets();
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }
        backToOrder(event){
            this.env.posbus.trigger('close-popup', {
                popupId: this.props.id,
                response: { confirmed: false, payload: null },
            });
        }
        _getAddProductOptions(eventTicket) {
            return eventTicket._prepareOrderlineOptions();
        }
        _clickEventTicket(ev) {
            const eventTicket = ev.detail;
            if (!this.currentOrder) {
                this.env.pos.add_new_order();
            }
            const product = eventTicket.getProduct();
            const options = this._getAddProductOptions(eventTicket);
            if (!options) {
                return;
            }
            this.currentOrder.add_product(product, options);
        }
    }
    EventTicketsPopup.template = "EventTicketsPopup";

    Registries.Component.add(EventTicketsPopup);
    return EventTicketsPopup;
});
