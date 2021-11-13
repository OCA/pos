/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.ReceiptScreen", function (require) {
    "use strict";

    const ReceiptScreen = require("point_of_sale.ReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleReceiptScreen = (ReceiptScreen) =>
        class extends ReceiptScreen {
            /**
             * Prints the event registration receipts through the printer proxy.
             * Doesn't do anything if there's no proxy printer.
             *
             * @returns {Boolean}
             */
            async _printEventRegistrationReceipts() {
                if (this.env.pos.proxy.printer) {
                    for (const receiptEl of this.el.getElementsByClassName(
                        "event-registration-receipt"
                    )) {
                        const printResult =
                            await this.env.pos.proxy.printer.print_receipt(
                                receiptEl.outerHTML
                            );
                        if (!printResult.successful) {
                            console.error("Unable to print event registration receipt");
                            console.debug(printResult);
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
            /**
             * @override
             */
            async _printReceipt() {
                // First, print the order receipt
                const printed = await super._printReceipt();
                // Then, print the event registration receipts
                if (printed && this.env.pos.proxy.printer) {
                    const registrationsPrinted =
                        await this._printEventRegistrationReceipts();
                    if (!registrationsPrinted) {
                        return false;
                    }
                }
                return printed;
            }
        };

    Registries.Component.extend(ReceiptScreen, PosEventSaleReceiptScreen);
    return ReceiptScreen;
});
