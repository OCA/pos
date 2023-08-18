/* eslint-disable */
odoo.define("pos_order_zip.ZipCodeScreen", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");

    class ZipCodeScreen extends PosComponent {
        async onClick() {
            let self = this;
            const selectedOrder = this.env.pos.get_order();

            if (this.env.pos.config.is_zipcode_required) {
                const {confirmed, payload: zipCode} = await this.showPopup(
                    "TextInputPopup",
                    {
                        title: this.env._t("Enter Zip Code!"),
                        startingValue:
                            (selectedOrder.partner && selectedOrder.partner.zip) ||
                            selectedOrder.get_zipcode(),
                    }
                );

                if (confirmed) {
                    const isCodeMatch = this.env.pos.zipcodes.filter(
                        (z) => z.zip_code === zipCode
                    );
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
                            this.showPopup("ErrorPopup", {
                                title: this.env._t("Zip Code Is Invalid !"),
                                body: this.env._t("Zip Must Be Nine Digit."),
                            });
                        } else if (confirmed) {
                            const {confirmed} = await this.showPopup("ConfirmPopup", {
                                title: this.env._t("Zipcode Not Verified!"),
                                body: this.env._t(
                                    "Are You Sure You Want To Set This Zip Code?"
                                ),
                            });
                            if (confirmed) {
                                selectedOrder.set_zipcode(zipCode);
                            }
                        }
                    }
                }
                return true;
            }
        }
    }

    ZipCodeScreen.template = "ZipCodeScreen";
    ProductScreen.addControlButton({
        component: ZipCodeScreen,
        condition: function () {
            return this.env.pos.config.is_zipcode_required;
        },
    });
    Registries.Component.add(ZipCodeScreen);
    return ZipCodeScreen;
});
