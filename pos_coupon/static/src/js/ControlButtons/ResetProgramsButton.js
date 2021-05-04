odoo.define("pos_coupon.ResetProgramsButton", function(require) {
    "use strict";

    const screens = require("point_of_sale.screens");
    const ActionButtonWidget = screens.ActionButtonWidget;

    const ResetProgramsButton = ActionButtonWidget.extend({
        template: "ResetProgramsButton",
        button_click: function() {
            const order = this.pos.get_order();
            order.resetPrograms();
        },
    });

    screens.define_action_button({
        name: "ResetProgramsButton",
        widget: ResetProgramsButton,
        condition: function() {
            return this.pos.config.use_coupon_programs;
        },
    });

    return ResetProgramsButton;
});
