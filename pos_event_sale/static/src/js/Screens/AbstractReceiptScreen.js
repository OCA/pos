/*
    Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.AbstractReceiptScreen", function (require) {
    "use strict";

    const AbstractReceiptScreen = require("point_of_sale.AbstractReceiptScreen");
    const Registries = require("point_of_sale.Registries");

    /* eslint-disable no-shadow */
    const PosEventSaleAbstractReceiptScreen = (AbstractReceiptScreen) =>
        class extends AbstractReceiptScreen {
            /**
             * Prints the event registration receipts through the printer proxy.
             * Doesn't do anything if there's no proxy printer.
             *
             * @returns {Boolean}
             */
            async _printEventRegistrations() {
                if (this.env.pos.proxy.printer) {
                    const $receipts = this.el.getElementsByClassName(
                        "event-registration-receipt"
                    );
                    for (const $receipt of $receipts) {
                        const printResult =
                            await this.env.pos.proxy.printer.print_receipt(
                                $receipt.outerHTML
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
        };

    Registries.Component.extend(
        AbstractReceiptScreen,
        PosEventSaleAbstractReceiptScreen
    );
    return AbstractReceiptScreen;
});
