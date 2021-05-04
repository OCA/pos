odoo.define("pos_coupon.screens", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");
    const core = require("web.core");
    const _t = core._t;

    const ActivePrograms = require("pos_coupon.ActivePrograms");

    /**
     * BACKPORT NOTE: In 15.0 this is implemented in a different object.
     * https://github.com/odoo/odoo/blob/54c42ae8365f7f15d4355acc449781f9e1926b72/addons/pos_coupon/static/src/js/ProductScreen.js#L12
     *
     * The goal is to capture "coupon" barcode reads and trigger the activateCode method.
     * There doesn't seem to be an easy way of doing it in 13.0, so it looks ugly compared to 15.0.
     *
     * The ScreenWidget is the base widget "inherited" by all other screens.
     * However they are inherited alomost immediately after their definition in core,
     * so we need to manually include the methods to all screens.
     *
     * Thus, the need for BarcodeCouponMixin
     */
    screens.BarcodeCouponMixin = {
        show: function() {
            const res = this._super.apply(this, arguments);
            const self = this;
            this.pos.barcode_reader.set_action_callback({
                coupon: _.bind(self.barcode_coupon_action, self),
            });
            return res;
        },
        barcode_coupon_action: function(code) {
            this.pos.get_order().activateCode(code.base_code);
        },
    };

    screens.ScreenWidget.include(screens.BarcodeCouponMixin);
    screens.ProductScreenWidget.include(screens.BarcodeCouponMixin);
    screens.PaymentScreenWidget.include(screens.BarcodeCouponMixin);
    screens.ClientListScreenWidget.include(screens.BarcodeCouponMixin);
    screens.ScaleScreenWidget.include(screens.BarcodeCouponMixin);

    screens.OrderWidget.include({
        /**
         * BACKPORT NOTE: In 15.0 this is implemented in a different object.
         * https://github.com/odoo/odoo/blob/54c42ae8365f7f15d4355acc449781f9e1926b72/addons/pos_coupon/static/src/js/ProductScreen.js#L30
         *
         * 1/ Perform the usual set value operation (super._setValue) if the line being modified
         * is not a reward line or if it is a reward line, the `val` being set is '' or 'remove' only.
         *
         * 2/ Update activated programs and coupons when removing a reward line.
         *
         * 3/ Trigger 'update-rewards' if the line being modified is a regular line or
         * if removing a reward line.
         *
         * @override
         */
        set_value(val) {
            const selectedLine = this.pos.get_order().get_selected_orderline();
            if (
                !selectedLine ||
                !selectedLine.is_program_reward ||
                (selectedLine.is_program_reward && ["", "remove"].includes(val))
            ) {
                this._super.apply(this, arguments);
            }
            if (!selectedLine) return;
            if (selectedLine.is_program_reward && val === "remove") {
                if (selectedLine.coupon_id) {
                    const coupon_code = Object.values(
                        selectedLine.order.bookedCouponCodes
                    ).find(
                        couponCode => couponCode.coupon_id === selectedLine.coupon_id
                    ).code;
                    delete selectedLine.order.bookedCouponCodes[coupon_code];
                    selectedLine.order.trigger("reset-coupons", [
                        selectedLine.coupon_id,
                    ]);
                    this.pos.gui.show_popup("alert", {
                        body: _.str.sprintf(
                            _t("Coupon (%s) has been deactivated."),
                            coupon_code
                        ),
                    });
                } else if (selectedLine.program_id) {
                    // Remove program from active programs
                    const index = selectedLine.order.activePromoProgramIds.indexOf(
                        selectedLine.program_id
                    );
                    selectedLine.order.activePromoProgramIds.splice(index, 1);
                    this.pos.gui.show_popup("alert", {
                        body: _.str.sprintf(
                            _t("%s program has been deactivated."),
                            this.pos.coupon_programs_by_id[selectedLine.program_id].name
                        ),
                    });
                }
            }
            if (
                !selectedLine.is_program_reward ||
                (selectedLine.is_program_reward && val === "remove")
            ) {
                selectedLine.order.trigger("update-rewards");
            }
        },
        /**
         * @override Render ActivePrograms widget
         **/
        renderElement: function() {
            this._super.apply(this, arguments);
            if (!this.activeProgramsWidget) {
                this.activeProgramsWidget = new ActivePrograms(this);
            }
            this.activeProgramsWidget.replace(
                $(this.el).find(".placeholder-ActivePrograms")
            );
        },
    });

    return screens;
});
