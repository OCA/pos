/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {PosDatePicker} from "../app/filter/datepicker_filter";

const {DateTime} = luxon;

// Extend TicketScreen components
TicketScreen.components = {
    ...TicketScreen.components,
    PosDatePicker,
};

/**
 * Patch TicketScreen to add Date filtering.
 */
patch(TicketScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.state.selectedDate = null;
        this.updateSelectedDate = this.updateSelectedDate.bind(this);
    },

    _getSearchFields() {
        const fields = super._getSearchFields(...arguments);
        // Remove default DATE field since we override it
        if (fields.DATE) {
            delete fields.DATE;
        }
        return fields;
    },

    async updateSelectedDate(newDate) {
        this.state.selectedDate = newDate;
    },

    /**
     * Return UTC date range for the selected date.
     */
    getUtcDateRange() {
        if (!this.state.selectedDate) {
            return null;
        }

        const date = DateTime.fromISO(this.state.selectedDate, {zone: "local"});
        return {
            fromDate: date.startOf("day").toUTC(),
            toDate: date.endOf("day").toUTC(),
        };
    },

    /**
     * Extend order list filtering with date range filter.
     */
    getFilteredOrderList() {
        let orders = super.getFilteredOrderList();
        const utcRange = this.getUtcDateRange();

        if (utcRange) {
            orders = orders.filter((order) => {
                const orderDate = DateTime.fromFormat(
                    order.date_order,
                    "yyyy-MM-dd HH:mm:ss",
                    {zone: "utc"}
                );
                return orderDate >= utcRange.fromDate && orderDate <= utcRange.toDate;
            });
        }
        return orders;
    },
});
