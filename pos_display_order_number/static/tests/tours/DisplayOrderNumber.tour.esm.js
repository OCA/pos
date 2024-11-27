/** @odoo-module */

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("DisplayOrderNumber", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            // Go by default to home category
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            {
                content: "Check Order Number is shown",
                trigger: ".product-screen:has(div.order-number)",
                isCheck: true,
            },
            Chrome.endTour(),
        ].flat(),
});
