odoo.define("pos_global_discount_in_line.GlobalLineDiscount", function (require) {
    "use strict";

    const DiscountButton = require("pos_discount.DiscountButton");
    const Registries = require("point_of_sale.Registries");

    const GlobalLineDiscount = (OriginalDiscountButton) =>
        class extends OriginalDiscountButton {
            async onClick() {
                // Replaced to remove rounding
                var self = this;
                const {confirmed, payload} = await this.showPopup("NumberPopup", {
                    title: this.env._t("Discount Percentage"),
                    startingValue: this.env.pos.config.discount_pc,
                });
                if (confirmed) {
                    await self.apply_discount(payload.replace(",", "."));
                }
            }
            async apply_discount(pc) {
                if (this.env.pos.config.global_discount_in_line) {
                    var order = this.env.pos.get_order();
                    var lines = order.get_orderlines();
                    for (const ind in lines) {
                        lines[ind].discount = pc;
                        lines[ind].discountStr = String(pc);
                    }
                    order.deselect_orderline();
                } else {
                    super.apply_discount(pc);
                }
            }
        };

    Registries.Component.extend(DiscountButton, GlobalLineDiscount);

    return DiscountButton;
});
