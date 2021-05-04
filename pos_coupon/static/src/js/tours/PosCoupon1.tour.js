/* eslint-disable */
odoo.define("pos_coupon.tour.pos_coupon1", function(require) {
    "use strict";

    // --- PoS Coupon Tour Basic Part 1 ---
    // Generate coupons for PosCouponTour2.

    const {startSteps, getSteps, createTourMethods} = require("pos_coupon.tour.utils");
    const {PosCoupon} = require("pos_coupon.tour.PosCouponTourMethods");
    const {
        ProductScreenDo,
        ProductScreenExecute,
    } = require("pos_coupon.tour.PosCouponTourPosMethods");
    const {ProductScreen} = createTourMethods(
        "ProductScreen",
        ProductScreenDo,
        class {},
        ProductScreenExecute
    );
    var Tour = require("web_tour.tour");

    startSteps();

    ProductScreen.do.clickHomeCategory();

    // Basic order
    // just accept the automatically applied promo program
    // applied programs:
    //   - on cheapest product
    ProductScreen.exec.addOrderline("Whiteboard Pen", "5");
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.88");
    PosCoupon.do.selectRewardLine("on cheapest product");
    PosCoupon.check.orderTotalIs("13.12");
    PosCoupon.exec.finalizeOrder("Cash", "20");

    // Remove the reward from auto promo program
    // no applied programs
    ProductScreen.exec.addOrderline("Whiteboard Pen", "6");
    PosCoupon.check.hasRewardLine("on cheapest product", "-2.88");
    PosCoupon.check.orderTotalIs("16.32");
    PosCoupon.exec.removeRewardLine("90.0% discount on cheapest product");
    PosCoupon.check.orderTotalIs("19.2");
    PosCoupon.exec.finalizeOrder("Cash", "20");

    // Order with coupon code from coupon program
    // applied programs:
    //   - coupon program
    ProductScreen.exec.addOrderline("Desk Organizer", "9");
    PosCoupon.check.hasRewardLine("on cheapest product", "-4.59");
    PosCoupon.exec.removeRewardLine("90.0% discount on cheapest product");
    PosCoupon.check.orderTotalIs("45.90");
    PosCoupon.do.enterCode("invalid_code");
    PosCoupon.do.closeAlert();
    PosCoupon.do.enterCode("1234");
    PosCoupon.check.hasRewardLine("Free Product - Desk Organizer", "-15.30");
    PosCoupon.exec.finalizeOrder("Cash", "50");

    // Use coupon but eventually remove the reward
    // applied programs:
    //   - on cheapest product
    ProductScreen.exec.addOrderline("Letter Tray", "4");
    ProductScreen.exec.addOrderline("Desk Organizer", "9");
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-4.32");
    PosCoupon.check.orderTotalIs("60.78");
    PosCoupon.do.enterCode("5678");
    PosCoupon.check.hasRewardLine("Free Product - Desk Organizer", "-15.30");
    PosCoupon.check.orderTotalIs("45.48");
    PosCoupon.exec.removeRewardLine("Free Product - Desk Organizer");
    PosCoupon.check.orderTotalIs("60.78");
    PosCoupon.exec.finalizeOrder("Cash", "90");

    // Specific product discount
    // applied programs:
    //   - on cheapest product
    //   - on specific products
    ProductScreen.exec.addOrderline("Magnetic Board", "10"); // 1.98
    ProductScreen.exec.addOrderline("Desk Organizer", "3"); // 5.1
    ProductScreen.exec.addOrderline("Letter Tray", "4"); // 4.8
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-1.78");
    PosCoupon.check.orderTotalIs("52.52");
    PosCoupon.do.enterCode("promocode");
    PosCoupon.check.hasRewardLine("50.0% discount on products", "-17.55");
    PosCoupon.check.orderTotalIs("34.97");
    PosCoupon.exec.finalizeOrder("Cash", "50");

    Tour.register("PosCouponTour1", {test: true, url: "/pos/web"}, getSteps());
});
