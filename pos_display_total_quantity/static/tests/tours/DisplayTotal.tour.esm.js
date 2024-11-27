/** @odoo-module */

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";
import {inLeftSide} from "@point_of_sale/../tests/tours/helpers/utils";

export function checkTotalQty(number) {
    return inLeftSide([
        {
            content: `check total qty`,
            trigger: `.product-screen .summary-left .total-quantity:contains("${number}")`,
            isCheck: true,
        },
    ]);
}

registry.category("web_tour.tours").add("DisplayTotalQty", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            // Go by default to home category
            ProductScreen.clickHomeCategory(),

            // Clicking product multiple times should increment quantity
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            checkTotalQty(1),
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            checkTotalQty(2),
            Chrome.endTour(),
        ].flat(),
});
