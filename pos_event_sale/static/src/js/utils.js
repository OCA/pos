/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.utils", function () {
    "use strict";

    /**
     * @param {Date} start
     * @param {Date} end
     * @returns Array of dates between start and end, without time
     */
    function getDatesInRange(start, end) {
        const days = moment(end).diff(moment(start), "days") + 1;
        return [...Array(days).keys()].map((dayn) =>
            moment(start).add(dayn, "days").startOf("day").toDate()
        );
    }

    return {getDatesInRange};
});
