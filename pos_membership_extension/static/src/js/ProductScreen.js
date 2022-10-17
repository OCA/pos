odoo.define("pos_membership_extension.ProductScreen", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    // eslint-disable-next-line no-shadow
    const OverloadProductScreen = (ProductScreen) =>
        // eslint-disable-next-line no-shadow
        class OverloadProductScreen extends ProductScreen {
            async _getAddProductOptions(product) {
                var self = this;
                if (!product.get_membership_allowed(this.env.pos.get_order().partner)) {
                    await this.showPopup("ErrorPopup", {
                        title: self.env._t("Incorrect Membership"),
                        body: self.env._t(
                            "Please select a customer that belong to one of the related membership categories."
                        ),
                    });
                    return;
                }
                return await super._getAddProductOptions(...arguments);
            }
        };

    Registries.Component.extend(ProductScreen, OverloadProductScreen);

    return ProductScreen;
});
