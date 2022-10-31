odoo.define("pos_productControl.CashBoxOpening", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const CashBoxOpening = require("point_of_sale.CashBoxOpening");

    const {useState} = owl.hooks;

    const PosProductControlCashOpeningBox = (CashBoxOpening) =>
        class extends CashBoxOpening {
            constructor() {
                super(...arguments);
                const productIds = this.env.pos.config.product_ids;
                const obj = productIds.reduce((accumulator, value) => {
                    return {...accumulator, [value]: ""};
                }, {});
                this.state = useState({
                    productControl: obj,
                });
            }

            updateProductInventory() {
                const productIds = this.env.pos.config.product_ids;
                productIds.forEach((productID) => {
                    const value = $(`#${productID}`).val();
                    this.state.productControl[productID] = value;
                });
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

    Registries.Component.extend(CashBoxOpening, PosProductControlCashOpeningBox);

    return CashBoxOpening;
});
