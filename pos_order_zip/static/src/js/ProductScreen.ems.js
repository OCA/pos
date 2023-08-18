/* eslint-disable */
odoo.define("pos_order_zip.ProductScreen", function (require) {
    "use strict";
    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("@web/core/utils/hooks");
    const PosZipCodeProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _onClickPay() {
                const selectedOrder = this.env.pos.get_order();
                if (
                    this.env.pos.config.is_zipcode_required &&
                    !selectedOrder.get_zipcode()
                ) {
                    const {confirmed, payload: zipCode} = await this.showPopup(
                        "TextInputPopup",
                        {
                            title: this.env._t("Enter Zip Code!"),
                            startingValue: (this.partner && this.partner.zip) || "",
                        }
                    );
                    if (!confirmed) {
                        return false;
                    } else {
                        const isCodeMatch = this.env.pos.zipcodes.filter(
                            (z) => z.zip_code === zipCode
                        );
                        const selectedOrder = this.env.pos.get_order();
                        if (isCodeMatch.length) {
                            selectedOrder.set_zipcode(zipCode);
                        } else {
                            if (!zipCode) {
                                return this.showPopup("ErrorPopup", {
                                    title: this.env._t("Zip Code Is Required!"),
                                    body: this.env._t("Please enter the zip code."),
                                });
                            }
                            if (zipCode.length > 10) {
                                return this.showPopup("ErrorPopup", {
                                    title: this.env._t("Zip Code Is Invalid !"),
                                    body: this.env._t("Zip Must Be Nine Digit."),
                                });
                            } else if (confirmed) {
                                const {confirmed} = await this.showPopup(
                                    "ConfirmPopup",
                                    {
                                        title: this.env._t("Zipcode Not Verified!"),
                                        body: this.env._t(
                                            "Are You Sure You Want To Set This Zip Code?"
                                        ),
                                    }
                                );
                                if (!confirmed) {
                                    return false;
                                }
                                selectedOrder.set_zipcode(zipCode);
                            }
                        }
                    }
                }
                return super._onClickPay(...arguments);
            }
        };
    Registries.Component.extend(ProductScreen, PosZipCodeProductScreen);
    return ProductScreen;
});
