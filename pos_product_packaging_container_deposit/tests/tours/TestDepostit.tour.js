/*
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
odoo.define(
    "pos_product_packaging_container_deposit.tour.TestDepostit",
    function (require) {
        "use strict";

        const {Chrome} = require("point_of_sale.tour.ChromeTourMethods");
        const {ProductScreen} = require("point_of_sale.tour.ProductScreenTourMethods");
        const {getSteps, startSteps} = require("point_of_sale.tour.utils");
        const Tour = require("web_tour.tour");

        startSteps();

        Chrome.check.isCashMoveButtonShown();

        ProductScreen.do.confirmOpeningPopup();
        ProductScreen.do.clickHomeCategory();

        // Add a product with its barcode
        ProductScreen.do.scan_barcode("A0001");
        ProductScreen.check.selectedOrderlineHas("Box", "1.00");
        ProductScreen.do.scan_barcode("B0002");
        ProductScreen.do.scan_barcode("B0002");
        ProductScreen.check.selectedOrderlineHas("Product B", "48");

        Tour.register("TestDepositProduct", {test: true, url: "/pos/ui"}, getSteps());
    }
);

/* */
