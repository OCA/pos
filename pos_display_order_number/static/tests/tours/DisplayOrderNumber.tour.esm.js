import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";
import {inLeftSide} from "@point_of_sale/../tests/tours/utils/common";

registry.category("web_tour.tours").add("DisplayOrderNumber", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickDisplayedProduct("Desk Organizer"),
            inLeftSide({
                content: "Check Order Number is shown",
                trigger:
                    ".product-screen:has(div#extra-info-container div.order-number)",
            }),
            Chrome.endTour(),
        ].flat(),
});
