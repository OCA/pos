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

            updateProductInventory() {
                const productIds = this.env.pos.config.product_ids;
                productIds.forEach((productID) => {
                    const value = $(`#${productID}`).val();
                    this.productControl[productID] = value;
                });
            }

            async closeSession() {
                await this.rpc({
                    model: "pos.session",
                    method: "set_product_close",
                    args: [this.env.pos.pos_session.id, this.productControl],
                });
                super.closeSession();
            }

            /* Getters */

            get product() {
                const productReference = this.env.pos.db.get_product_by_id(
                    this.product_id
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
