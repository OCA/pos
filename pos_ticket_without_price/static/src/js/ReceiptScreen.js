/* Copyright 2021 Initos Gmbh
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_ticket_without_price.ReceiptScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ReceiptScreen = require("point_of_sale.ReceiptScreen");

    const PosReceiptScreen = (ReceiptScreen) =>
        class PosReceiptScreen extends ReceiptScreen {
            async printReceiptwithoutprice() {
                var pos_receipt = $(this.el).find(".pos-receipt");
                var pos_receipt_without_price = $(this.el).find(
                    ".pos-receipt-without-price"
                );
                pos_receipt.css("display", "none");
                pos_receipt_without_price.css("display", "block");
                const isPrinted = await this._printReceipt();
                if (isPrinted) {
                    this.currentOrder._printed = true;
                }
            }

            async printReceipt() {
                var pos_receipt = $(this.el).find(".pos-receipt");
                if (pos_receipt.length > 1) {
                    pos_receipt[0].style.display = "block";
                }
                var pos_receipt_without_price = $(this.el).find(
                    ".pos-receipt-without-price"
                );
                pos_receipt_without_price.css("display", "none");
                const isPrinted = await this._printReceipt();
                if (isPrinted) {
                    this.currentOrder._printed = true;
                }
            }
        };

    Registries.Component.extend(ReceiptScreen, PosReceiptScreen);
    return ReceiptScreen;
});
