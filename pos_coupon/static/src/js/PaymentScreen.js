/* eslint-disable */
odoo.define("pos_coupon.PaymentScreen", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");
    const PaymentScreenWidget = screens.PaymentScreenWidget;
    const session = require("web.session");
    const rpc = require("web.rpc");

    PaymentScreenWidget.include({
        post_push_order_resolve: function(order, server_ids) {
            const self = this;
            const _super = this._super;
            const bookedCouponIds = new Set(
                Object.values(order.bookedCouponCodes)
                    .map(couponCode => couponCode.coupon_id)
                    .filter(coupon_id => coupon_id)
            );
            const usedCouponIds = order.orderlines.models
                .map(line => line.coupon_id)
                .filter(coupon_id => coupon_id);
            for (const coupon_id of usedCouponIds) {
                bookedCouponIds.delete(coupon_id);
            }
            const unusedCouponIds = [...bookedCouponIds.values()];
            return new Promise(function(resolve, reject) {
                rpc.query({
                    model: "pos.order",
                    method: "validate_coupon_programs",
                    args: [
                        server_ids,
                        order.programIdsToGenerateCoupons || [],
                        unusedCouponIds,
                    ],
                    kwargs: {context: session.user_context},
                })
                    .then(function(generated_coupons) {
                        order.generated_coupons = generated_coupons;
                        _super
                            .apply(self, [order, server_ids])
                            .then(function() {
                                resolve();
                            })
                            .catch(function(err) {
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
        },
    });

    return PaymentScreenWidget;
});
