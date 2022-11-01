odoo.define("pos_productControl.CashBoxOpening", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const CashBoxOpening = require("point_of_sale.CashBoxOpening");

    const PosProductControlCashOpeningBox = (CashBoxOpening) =>
        class extends CashBoxOpening {
            constructor() {
                super(...arguments);
                const productIds = this.env.pos.config.product_ids;
                const obj = productIds.reduce((accumulator, value) => {
                    return {...accumulator, [value]: ""};
                }, {});
                this.productControl = obj;
            }

            updateOpeningProductInventory() {
                const productIds = this.env.pos.config.product_ids;
                productIds.forEach((productID) => {
                    const value = $(`#${productID}`).val();
                    this.productControl[productID] = value;
                });
            }

            async startSession() {
                await this.rpc({
                    model: "pos.session",
                    method: "update_product_opening_value",
                    args: [this.env.pos.pos_session.id, this.productControl],
                });
                super.startSession();
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

    Registries.Component.extend(CashBoxOpening, PosProductControlCashOpeningBox);

    return CashBoxOpening;
});
