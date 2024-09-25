/** @odoo-module **/
import {PosLoyalty} from "pos_loyalty.tour.PosCouponTourMethods";
import {ProductScreen} from "point_of_sale.tour.ProductScreenTourMethods";
import {getSteps, startSteps} from "point_of_sale.tour.utils";
import Tour from "web_tour.tour";

startSteps();
ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();
ProductScreen.exec.addOrderline("Product 1", "1.00", "100");
PosLoyalty.do.clickDiscountButton();
PosLoyalty.do.clickConfirmButton();
ProductScreen.check.totalAmountIs("100.00");
ProductScreen.exec.addOrderline("Product 2", "1.00", "100");
PosLoyalty.do.clickDiscountButton();
PosLoyalty.do.clickConfirmButton();
// Total = Product 1 + Product 2 - 10% (Product 2)
ProductScreen.check.totalAmountIs("190.00");

Tour.register("PosBypassGlobalDiscount", {test: true, url: "/pos/web"}, getSteps());
