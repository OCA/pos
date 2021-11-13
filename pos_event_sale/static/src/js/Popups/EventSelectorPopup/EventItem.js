/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventItem", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class EventItem extends PosComponent {
        /**
         * @param {Object} props
         * @param {Object} props.event
         */
        constructor() {
            super(...arguments);
            this.state = useState({
                seatsAvailable: this.props.event.getSeatsAvailableReal(),
            });
        }
        get disabled() {
            return this.state.seatsAvailable <= 0;
        }
        get addedClasses() {
            return {
                disabled: this.disabled,
            };
        }
        formatDate(date) {
            return moment(date).format("lll");
        }
        clickEvent() {
            if (!this.disabled) {
                this.trigger("click-event", this.props);
            }
        }
    }
    EventItem.template = "EventItem";

    Registries.Component.add(EventItem);
    return EventItem;
});
