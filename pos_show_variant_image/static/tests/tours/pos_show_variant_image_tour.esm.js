import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosShowVariantImageTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            ProductScreen.clickDisplayedProduct("Test Configurable Product"),
            Dialog.is({title: "Attribute selection"}),

            {
                content: "product image is shown in the attribute selection popup",
                trigger: ".modal img.pos-show-product-image",
            },

            Dialog.cancel(),
            Chrome.endTour(),
        ].flat(),
});
