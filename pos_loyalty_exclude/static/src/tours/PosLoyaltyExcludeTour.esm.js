/** @odoo-module **/

import {ProductScreen} from "point_of_sale.tour.ProductScreenTourMethods";
import {getSteps, startSteps} from "point_of_sale.tour.utils";
import Tour from "web_tour.tour";

startSteps();
ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer("Mr Odoo");
ProductScreen.exec.addOrderline("Product Include Loyalty", "1.00", "90");
ProductScreen.check.totalAmountIs("90.00");
// Excluded-loyalty product has no effect on the minimum amount required to apply for the loyalty program.
ProductScreen.exec.addOrderline("Product Exclude Loyalty", "1.00", "100");
ProductScreen.check.totalAmountIs("190.00");

// Increase the quantity of applicable product for loyalty program
ProductScreen.do.clickOrderline("Product Include Loyalty", "1.00");
ProductScreen.do.pressNumpad("Qty 2"); // Change the quantity of the product to 2
ProductScreen.check.totalAmountIs("270.00");

Tour.register("PosExcludeLoyaltyPromotion", {test: true, url: "/pos/web"}, getSteps());
