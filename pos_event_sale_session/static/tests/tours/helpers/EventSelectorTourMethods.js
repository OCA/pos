/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.tour.EventSelectorTourMethods", function (require) {
    /* eslint-disable no-empty-function */
    "use strict";

    const {createTourMethods} = require("point_of_sale.tour.utils");
    const {
        Do,
        Check,
        Execute,
    } = require("pos_event_sale.tour.EventSelectorTourMethods");

    class DoExt extends Do {
        clickDisplayedEvent(eventName, nth = 1) {
            return [
                {
                    content: `clicking event ${eventName}`,
                    trigger: `.event-selector-popup .event:has(.event-name:contains("${eventName}")):nth-child(${nth})`,
                },
            ];
        }
    }

    class CheckExt extends Check {
        eventIsDisplayed(eventName, nth = 1) {
            return [
                {
                    content: `'${eventName}' should be displayed`,
                    trigger: `.event-selector-popup .event:has(.event-name:contains("${eventName}")):nth-child(${nth})`,
                    run: () => {},
                },
            ];
        }
        eventHasAvailabilityLabel(eventName, nth = 1, label) {
            return [
                ...this.eventIsDisplayed(eventName),
                {
                    content: `'${eventName}' should contain label ${label}`,
                    trigger: `.event-selector-popup .event:has(.event-name:contains("${eventName}")):nth-child(${nth}) .event-availability-tag:contains("${label}")`,
                    run: () => {},
                },
            ];
        }
    }

    class ExecuteExt extends Execute {}

    return createTourMethods("EventSelector", DoExt, CheckExt, ExecuteExt);
});
