import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as ProductScreen from "@point_of_sale/../tests/pos/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("SearchProductByDefaultCode", {
    steps: () =>
        [
            Chrome.startPoS(),
            ProductScreen.searchProduct("CHAIR_01"),
            ProductScreen.clickDisplayedProduct("[CHAIR_01] Test sofa", true, "1.0"),
            ProductScreen.closePos(),
        ].flat(),
});
