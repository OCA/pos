odoo.define("pos_product_control.ClosePosPopup", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ClosePosPopup = require("pos_cash_control.ClosePosPopup");

    const PosProductControlClosePosPopup = (ClosePosPopup) =>
        class extends ClosePosPopup {
            constructor() {
                super(...arguments);
                const productIds = this.env.pos.config.product_ids;
                const obj = productIds.reduce((accumulator, value) => {
                    return {...accumulator, [value]: ""};
                }, {});
                this.productControl = obj;
            }

            updateCloseProductInventory() {
                const productIds = this.env.pos.config.product_ids;
                productIds.forEach((productID) => {
                    const value = Number($(`#${productID}`).val());
                    this.productControl[productID] = value;
                });
            }

            async closeSession() {
                if (this.checkClosingValues()) {
                    await this.rpc({
                        model: "pos.session",
                        method: "update_product_closing_value",
                        args: [this.env.pos.pos_session.id, this.productControl],
                    });
                    super.closeSession();
                } else {
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("Value Error"),
                        body: this.env._t(
                            "One of the fields for product control is empty."
                        ),
                    });
                }
            }

            checkClosingValues() {
                for (const item in this.productControl) {
                    if (!this.productControl[item]) {
                        return false;
                    }
                }
                return true;
            }

            /* Getters */

            get product() {
                const productReference = this.env.pos.db.get_product_by_id(
                    this.productID
                );
                return productReference;
            }

            get name() {
                return this.product.display_name;
            }
        };

    Registries.Component.extend(ClosePosPopup, PosProductControlClosePosPopup);

    return ClosePosPopup;
});
