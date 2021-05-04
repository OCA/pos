/* eslint-disable */
odoo.define("pos_coupon.tour.pos_coupon2", function(require) {
    "use strict";

    // --- PoS Coupon Tour Basic Part 2 ---
    // Using the coupons generated from PosCouponTour1.

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

    // Cheapest product discount should be replaced by the global discount
    // because it's amount is lower.
    // Applied programs:
    //   - global discount
    ProductScreen.exec.addOrderline("Desk Organizer", "5"); // 5.1
    PosCoupon.check.hasRewardLine("on cheapest product", "-4.59");
    ProductScreen.exec.addOrderline("Letter Tray", "4"); // 4.8
    PosCoupon.check.hasRewardLine("on cheapest product", "-4.32");
    PosCoupon.do.enterCode("123456");
    PosCoupon.check.hasRewardLine("10.0% discount on total amount", "-4.47");
    PosCoupon.check.orderTotalIs("40.23");
    PosCoupon.exec.finalizeOrder("Cash", "50");

    // Use coupon from global discount but on cheapest discount prevails.
    // The global discount coupon should be consumed during the order as it is
    // activated in the order. But upon validation, the coupon should return
    // to new state.
    // Applied programs:
    //   - on cheapest discount
    ProductScreen.exec.addOrderline("Small Shelf", "3"); // 2.83 per item
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.55");
    PosCoupon.do.enterCode("345678");
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.55");
    ProductScreen.exec.addOrderline("Desk Organizer", "9"); // 4.80 per item
    PosCoupon.check.hasRewardLine("10.0% discount on total amount", "-5.44");
    ProductScreen.do.pressNumpad("Backspace Backspace");
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.55");
    ProductScreen.exec.addOrderline("Desk Pad", "1"); // 1.98
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-1.78");
    PosCoupon.check.orderTotalIs("8.69");
    PosCoupon.exec.finalizeOrder("Cash", "10");

    // Scanning coupon twice.
    // Also apply global discount on top of free product to check if the
    // calculated discount is correct.
    // Applied programs:
    //  - coupon program (free product)
    //  - global discount
    ProductScreen.exec.addOrderline("Desk Organizer", "9"); // 5.1 per item
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-4.59");
    PosCoupon.check.orderTotalIs("41.31");
    // Add global discount and the discount will be replaced
    PosCoupon.do.enterCode("345678");
    PosCoupon.check.hasRewardLine("10.0% discount on total amount", "-4.59");
    // Add free product coupon (for qty=9, free=3)
    // the discount should change after having free products
    // it should go back to cheapest discount as it is higher
    PosCoupon.do.enterCode("5678");
    PosCoupon.check.hasRewardLine("Free Product - Desk Organizer", "-15.30");
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-4.59");
    PosCoupon.exec.finalizeOrder("Cash", "60");

    // Specific products discount (with promocode) and free product (1357)
    // Applied programs:
    //   - discount on specific products
    //   - free product
    ProductScreen.exec.addOrderline("Desk Organizer", "6"); // 5.1 per item
    PosCoupon.check.hasRewardLine("on cheapest product", "-4.59");
    PosCoupon.exec.removeRewardLine("90.0% discount on cheapest product");
    PosCoupon.do.enterCode("promocode");
    PosCoupon.check.hasRewardLine("50.0% discount on products", "-15.30");
    PosCoupon.do.enterCode("1357");
    PosCoupon.check.hasRewardLine("Free Product - Desk Organizer", "-10.20");
    PosCoupon.check.hasRewardLine("50.0% discount on products", "-10.20");
    PosCoupon.check.orderTotalIs("10.20");
    PosCoupon.exec.finalizeOrder("Cash", "20");

    // Check reset program
    // Enter two codes and reset the programs.
    // The codes should be checked afterwards. They should return to new.
    // Applied programs:
    //   - cheapest product
    PosCoupon.do.enterCode("2468");
    PosCoupon.do.enterCode("098765");
    ProductScreen.exec.addOrderline("Monitor Stand", "6"); // 3.19 per item
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.87");
    PosCoupon.check.orderTotalIs("16.27");
    PosCoupon.exec.removeRewardLine("90.0% discount on cheapest product");
    PosCoupon.check.hasRewardLine("10.0% discount on total amount", "-1.91");
    PosCoupon.do.resetActivePrograms();
    PosCoupon.check.hasRewardLine("90.0% discount on cheapest product", "-2.87");
    PosCoupon.check.orderTotalIs("16.27");
    PosCoupon.exec.finalizeOrder("Cash", "20");

    Tour.register("PosCouponTour2", {test: true, url: "/pos/web"}, getSteps());
});
