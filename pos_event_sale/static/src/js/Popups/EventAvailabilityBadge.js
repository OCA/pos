/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.EventAvailabilityBadge", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class EventAvailabilityBadge extends PosComponent {
        get renderInfo() {
            const seatsAvailable = this.props.seatsAvailable;
            const warningThreshold =
                this.env.pos.config.iface_event_seats_available_warning;
            if (seatsAvailable < 0) {
                return {
                    label: this.env._t("Oversold"),
                    addedClasses: {"bg-danger": true},
                };
            } else if (seatsAvailable == 0) {
                return {
                    label: this.env._t("Sold out"),
                    addedClasses: {"bg-danger": true},
                };
            } else if (warningThreshold && seatsAvailable <= warningThreshold) {
                return {
                    label: _.str.sprintf(this.env._t("%d remaining"), seatsAvailable),
                    addedClasses: {"bg-warning": true},
                };
            }
            return {
                label: false,
                addedClasses: {oe_hidden: true},
            };
        }
    }
    EventAvailabilityBadge.template = "EventAvailabilityBadge";

    Registries.Component.add(EventAvailabilityBadge);
    return EventAvailabilityBadge;
});
