odoo.define("pos_coupon.PromoCodeButton", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");
    const ActionButtonWidget = screens.ActionButtonWidget;
    const core = require("web.core");
    const _t = core._t;

    const PromoCodeButton = ActionButtonWidget.extend({
        template: "PromoCodeButton",
        button_click: function() {
            const self = this;
            this.gui.show_popup("textinput", {
                title: _t("Enter Promotion or Coupon Code"),
                value: "",
                confirm: function(code) {
                    if (code !== "") {
                        const order = self.pos.get_order();
                        order.activateCode(code);
                    }
                },
            });
        },
    });

    screens.define_action_button({
        name: "PromoCodeButton",
        widget: PromoCodeButton,
        condition: function() {
            return this.pos.config.use_coupon_programs;
        },
    });

    return PromoCodeButton;
});
