odoo.define("pos_cancel_reason.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _setValue(val) {
                const val_parsed = parseFloat(val);
                if (this.env.pos.config.reason_to_cancel) {
                    const selected_orderline = this.env.pos.get_order()
                        .selected_orderline;
                    const compared_qty = val_parsed < selected_orderline.quantity;
                    const compared_time =
                        (new Date() - new Date(selected_orderline.created_at)) / 1000 >
                        this.env.pos.config.delay_to_cancel;
                    if (compared_qty && compared_time) {
                        const cancel_reason_options = [];
                        for (const i in this.env.pos.cancel_reasons) {
                            cancel_reason_options.push({
                                id: this.env.pos.cancel_reasons[i].id,
                                label: this.env.pos.cancel_reasons[i].name,
                                item: this.env.pos.cancel_reasons[i],
                            });
                        }
                        const {
                            confirmed,
                            payload: selectedOption,
                        } = await this.showPopup("SelectionPopup", {
                            title: this.env._t(
                                "What is the reason for cancel these lines?"
                            ),
                            list: cancel_reason_options,
                        });
                        if (confirmed) {
                            const diffecence = selected_orderline.quantity - val_parsed;
                            this.env.pos
                                .get_order()
                                .save_cancelled_orderlines_info(
                                    diffecence,
                                    selectedOption
                                );
                            super._setValue(...arguments);
                        }
                    } else {
                        super._setValue(...arguments);
                    }
                } else {
                    super._setValue(...arguments);
                }
            }
        };
    Registries.Component.extend(ProductScreen, PosProductScreen);

    return ProductScreen;
});
