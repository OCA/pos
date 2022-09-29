odoo.define("pos_discount_reason.NumpadWidget", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const NumpadWidget = require("point_of_sale.NumpadWidget");

    const PosNumpadWidget = (NumpadWidget) =>
        class extends NumpadWidget {
            async changeMode(mode) {
                if (this.hasManualDiscount && mode === "discount") {
                    const discount_options = [];
                    for (const item in this.env.pos.discount_reasons
                        .line_discount_reasons) {
                        const reason = this.env.pos.discount_reasons.get_by_id(item);
                        const reason_value = " - " + reason.percent * 100 + "%";
                        discount_options.push({
                            label: reason.name + reason_value,
                            item: reason,
                            id: reason.id,
                        });
                    }
                    const {confirmed, payload} = await this.showPopup(
                        "SelectionPopup",
                        {
                            title: this.env._t("Discount Reason"),
                            list: discount_options,
                            confirmText: this.env._t("Confirm"),
                            cancelText: this.env._t("Cancel"),
                        }
                    );
                    if (confirmed) {
                        var order = this.env.pos.get_order();
                        var selectedOrderline = order.get_selected_orderline();
                        if (selectedOrderline) {
                            selectedOrderline.set_discount_reason(payload);
                        }
                    }
                    return;
                }
                super.changeMode(mode);
            }
        };

    Registries.Component.extend(NumpadWidget, PosNumpadWidget);

    return NumpadWidget;
});
