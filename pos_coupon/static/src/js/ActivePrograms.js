/* eslint-disable */
odoo.define("pos_coupon.ActivePrograms", function(require) {
    "use strict";

    const PosBaseWidget = require("point_of_sale.BaseWidget");

    const ActivePrograms = PosBaseWidget.extend({
        template: "ActivePrograms",

        init: function(parent, options) {
            this._super.apply(this, arguments);
            this.pos.bind("change:selectedOrder", this.change_selected_order, this);
            if (this.pos.get_order()) {
                this.bind_order_events();
            }
            this.renderParams = {};
        },

        change_selected_order: function() {
            if (this.pos.get_order()) {
                this.bind_order_events();
                this.renderElement();
            }
        },

        bind_order_events: function() {
            const order = this.pos.get_order();
            order.unbind("change", null, this);
            order.unbind("rewards-updated", null, this);
            order.bind("change", this.renderElement, this);
            order.bind("rewards-updated", this.renderElement, this);
        },

        /**
         * This is used to set the render parameters before eventually rendering this component.
         */
        _setRenderParams() {
            const order = this.pos.get_order();
            if (!order) {
                this.renderParams = {};
                return;
            }
            const unRewardedArray = order.rewardsContainer
                ? order.rewardsContainer.getUnawarded()
                : [];
            const nonGeneratingProgramIds = new Set(
                unRewardedArray.map(({program}) => program.id)
            );
            const nonGeneratingCouponIds = new Set(
                unRewardedArray
                    .map(({coupon_id}) => coupon_id)
                    .filter(coupon_id => coupon_id)
            );
            const onNextOrderPromoPrograms = order.activePromoProgramIds
                .filter(program_id => {
                    const program = order.pos.coupon_programs_by_id[program_id];
                    return (
                        program.promo_applicability === "on_next_order" &&
                        order.programIdsToGenerateCoupons &&
                        order.programIdsToGenerateCoupons.includes(program_id)
                    );
                })
                .map(program_id => order.pos.coupon_programs_by_id[program_id]);
            const onCurrentOrderPromoProgramIds = order.activePromoProgramIds.filter(
                program_id => {
                    const program = order.pos.coupon_programs_by_id[program_id];
                    return program.promo_applicability === "on_current_order";
                }
            );
            const withRewardsPromoPrograms = onCurrentOrderPromoProgramIds
                .filter(program_id => !nonGeneratingProgramIds.has(program_id))
                .map(program_id => {
                    const program = order.pos.coupon_programs_by_id[program_id];
                    return {
                        name: program.name,
                        promo_code: program.promo_code,
                    };
                });
            const withRewardsBookedCoupons = Object.values(order.bookedCouponCodes)
                .filter(couponCode => !nonGeneratingCouponIds.has(couponCode.coupon_id))
                .map(couponCode => {
                    const program =
                        order.pos.coupon_programs_by_id[couponCode.program_id];
                    return {
                        program_name: program.name,
                        coupon_code: couponCode.code,
                    };
                });
            Object.assign(this.renderParams, {
                withRewardsPromoPrograms,
                withRewardsBookedCoupons,
                onNextOrderPromoPrograms,
                show:
                    withRewardsPromoPrograms.length !== 0 ||
                    withRewardsBookedCoupons.length !== 0 ||
                    onNextOrderPromoPrograms.length !== 0,
            });
        },

        renderElement: function() {
            this._setRenderParams();
            return this._super.apply(this, arguments);
        },
    });

    return ActivePrograms;
});
