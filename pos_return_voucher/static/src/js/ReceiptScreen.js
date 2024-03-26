/* Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_return_voucher.ReceiptScreen", function (require) {
    "use strict";

    const ReceiptScreen = require("point_of_sale.ReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const ReturnVoucherReceiptScreen = (ReceiptScreen) =>
        class extends ReceiptScreen {
            async handleAutoPrint() {
                await this.waitBarcodeLoaded();
                return super.handleAutoPrint(...arguments);
            }
            async waitBarcodeLoaded() {
                const $img = $(this.el).find(".return-voucher-barcode img");
                return new Promise((resolve, reject) => {
                    if (
                        !$img ||
                        $img.length === 0 ||
                        ($img[0].complete && $img[0].naturalHeight !== 0)
                    ) {
                        resolve();
                    } else {
                        $img.on("load", () => {
                            resolve();
                        });
                        $img.on("error", (error) => {
                            reject(error);
                        });
                    }
                });
            }
        };

    Registries.Component.extend(ReceiptScreen, ReturnVoucherReceiptScreen);

    return ReceiptScreen;
});
