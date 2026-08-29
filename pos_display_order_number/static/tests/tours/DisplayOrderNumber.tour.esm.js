import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/generic_helpers/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/pos/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";
import {inLeftSide} from "@point_of_sale/../tests/pos/tours/utils/common";

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
