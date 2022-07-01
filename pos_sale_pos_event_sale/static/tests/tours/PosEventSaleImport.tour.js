/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_sale_pos_event_sale.tour.PosEventSaleImport", function (require) {
    "use strict";

    const {
        ProductScreen,
    } = require("pos_sale_pos_event_sale.tour.ProductScreenTourMethods");
    const {PaymentScreen} = require("point_of_sale.tour.PaymentScreenTourMethods");
    const {ReceiptScreen} = require("point_of_sale.tour.ReceiptScreenTourMethods");
    const {SelectionPopup} = require("point_of_sale.tour.SelectionPopupTourMethods");
    const {
        SaleOrderScreen,
    } = require("pos_sale_pos_event_sale.tour.SaleOrderScreenTourMethods");
    const {getSteps, startSteps} = require("point_of_sale.tour.utils");
    const Tour = require("web_tour.tour");

    startSteps();

    // Open session
    ProductScreen.do.confirmOpeningPopup();

    // Import SO, partially
    ProductScreen.do.clickSaleOrderButton();
    SaleOrderScreen.check.isShown();
    SaleOrderScreen.do.clickDisplayedOrder("TEST01");
    SelectionPopup.check.isShown();
    SelectionPopup.do.clickItem("Settle the order");

    // Change quantity of regular tickets to 1
    ProductScreen.do.clickOrderline("Standard", 2);
    ProductScreen.check.selectedOrderlineHas("Standard", "2.0", "30.00");
    ProductScreen.do.pressNumpad("1");
    ProductScreen.check.selectedOrderlineHas("Standard", "1.0", "15.00");

    // Check kids ticket is ok
    ProductScreen.do.clickOrderline("Kids", 1);
    ProductScreen.check.selectedOrderlineHas("Kids", "1.0", "5.00");

    // Payment
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Cash");
    PaymentScreen.do.pressNumpad("2 0");
    PaymentScreen.check.remainingIs("0.0");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.do.clickNextOrder();

    // Make a second order for the remaining quantity
    ProductScreen.do.clickSaleOrderButton();
    SaleOrderScreen.check.isShown();
    SaleOrderScreen.do.clickDisplayedOrder("TEST01");
    SelectionPopup.check.isShown();
    SelectionPopup.do.clickItem("Settle the order");
    ProductScreen.do.clickOrderline("Standard", 1);
    ProductScreen.do.clickOrderline("Kids", 0);
    ProductScreen.do.clickPayButton();
    PaymentScreen.do.clickPaymentMethod("Cash");
    PaymentScreen.do.pressNumpad("1 5");
    PaymentScreen.check.remainingIs("0.0");
    PaymentScreen.do.clickValidate();
    ReceiptScreen.do.clickNextOrder();

    Tour.register("PosEventSaleImportTour", {test: true, url: "/pos/ui"}, getSteps());
});
