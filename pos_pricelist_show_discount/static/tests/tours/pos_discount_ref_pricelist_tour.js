odoo.define("pos.tour.test_pos_discount_ref_pricelist", function (require) {
    "use strict";

    const {ProductScreen} = require("point_of_sale.tour.ProductScreenTourMethods");
    const {
        ProductScreenCustom,
    } = require("pos_pricelist_show_discount.tour.ProductScreenCustomTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    var tour = require("web_tour.tour");

    startSteps();

    ProductScreen.do.clickHomeCategory();
    ProductScreen.do.clickDisplayedProduct("Acoustic Bloc Screens");
    ProductScreen.check.noDiscountApplied("2,950.00");
    ProductScreen.do.clickDisplayedProduct("Office Chair Black");
    ProductScreenCustom.check.findInProductInfo("$ 100.00");
    ProductScreenCustom.check.findInProductInfo("40.00 %");
    ProductScreenCustom.check.findInProductInfo("Discount Reference Pricelist");
    ProductScreen.check.selectedOrderlineHas("Office Chair Black", "1.0", "60.00");

    tour.register(
        "test_pos_discount_ref_pricelist",
        {
            test: true,
        },
        getSteps()
    );
});
