odoo.define("pos_discount.DiscountReasonButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");

    class DiscountReasonButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener("click", this.onClick);
        }
        async onClick() {
            const discount_options = this.env.pos._mount_discount_options();
            const {confirmed, payload} = await this.showPopup("SelectionPopup", {
                title: this.env._t("Discount Reason"),
                list: discount_options,
                confirmText: this.env._t("Confirm"),
                cancelText: this.env._t("Cancel"),
            });
            if (confirmed) {
                await this.apply_discount(payload);
            }
        }
        async apply_discount(discount) {
            var order = this.env.pos.get_order();
            order.set_discount_reason(discount);
        }
    }
    DiscountReasonButton.template = "DiscountReasonButton";

    ProductScreen.addControlButton({
        component: DiscountReasonButton,
        condition: function () {
            return true;
        },
    });

    Registries.Component.add(DiscountReasonButton);

    return DiscountReasonButton;
});
