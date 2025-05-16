import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";
import {inLeftSide} from "@point_of_sale/../tests/tours/utils/common";

export function checkTotalQty(number) {
    return inLeftSide([
        {
            content: `check total qty`,
            trigger: `.product-screen #extra-info-container .total-quantity:contains("${number}")`,
        },
    ]);
}

registry.category("web_tour.tours").add("DisplayTotalQty", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Clicking product multiple times should increment quantity
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            checkTotalQty(1),
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            checkTotalQty(2),
            Chrome.endTour(),
        ].flat(),
});
