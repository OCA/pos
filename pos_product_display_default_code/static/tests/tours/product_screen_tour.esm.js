import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("SearchProductByDefaultCode", {
    steps: () =>
        [
            Chrome.startPoS(),
            ProductScreen.searchProduct("chair"),
            ProductScreen.clickDisplayedProduct("[CHAIR_01] Test sofa"),
            Chrome.endTour(),
        ].flat(),
});
