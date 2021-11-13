/*
Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
@author Iván Todorovich <ivan.todorovich@camptocamp.com>
License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.tour.EventSelectorTourMethods", function (require) {
    /* eslint-disable no-empty-function */
    "use strict";

    const {createTourMethods} = require("point_of_sale.tour.utils");

    class Do {
        clickDisplayedEvent(eventName) {
            return [
                {
                    content: `clicking event ${eventName}`,
                    trigger: `.event-selector-popup .event-name:contains("${eventName}")`,
                },
            ];
        }
        close() {
            return [
                {
                    content: `Close ticket selector`,
                    trigger: `.event-selector-popup .button.cancel`,
                },
            ];
        }
    }

    class Check {
        isShown() {
            return [
                {
                    content: "Event selector is shown",
                    trigger: ".event-selector-popup:not(.oe_hidden)",
                    run: () => {},
                },
            ];
        }
        eventIsDisplayed(eventName) {
            return [
                {
                    content: `'${eventName}' should be displayed`,
                    trigger: `.event-selector-popup .event-name:contains("${eventName}")`,
                    run: () => {},
                },
            ];
        }
        eventHasAvailabilityLabel(eventName, label) {
            return [
                ...this.eventIsDisplayed(eventName),
                {
                    content: `'${eventName}' should contain label ${label}`,
                    trigger: `.event-selector-popup .event:has(.event-name:contains("${eventName}")) .event-availability-tag:contains("${label}")`,
                    run: () => {},
                },
            ];
        }
    }

    return createTourMethods("EventSelector", Do, Check);
});
