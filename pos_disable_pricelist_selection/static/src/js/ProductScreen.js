odoo.define("pos_disable_pricelist_selection.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    const PosProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            constructor() {
                super(...arguments);
                _.each(this.constructor.controlButtons, function (button) {
                    if (button.name === "SetPricelistButton") {
                        button.condition = function () {
                            return (
                                this.env.pos.config.use_pricelist &&
                                this.env.pos.pricelists.length > 1 &&
                                !this.env.pos.config.hide_pricelist_button
                            );
                        };
                    }
                });
            }
        };

    Registries.Component.extend(ProductScreen, PosProductScreen);

    return ProductScreen;
});
