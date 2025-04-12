/** @odoo-module */

import {OrderReceipt} from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import {patch} from "@web/core/utils/patch";
import {useState} from "@odoo/owl";

patch(ReceiptScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.hidePriceState = useState({priceHidden: false});
    },
    hidePrice() {
        this.hidePriceState.priceHidden = !this.hidePriceState.priceHidden;
    },
    get priceHidden() {
        return this.hidePriceState.priceHidden;
    },
    async printReceipt() {
        this.buttonPrintReceipt.el.className = "fa fa-fw fa-spin fa-circle-o-notch";
        const isPrinted = await this.printer.print(
            OrderReceipt,
            {
                data: {
                    ...this.pos.get_order().export_for_printing(),
                    isBill: this.isBill,
                },
                formatCurrency: this.env.utils.formatCurrency,
                priceHidden: this.hidePriceState.priceHidden,
            },
            {webPrintFallback: true}
        );

        if (isPrinted) {
            this.currentOrder._printed = true;
        }

        if (this.buttonPrintReceipt.el) {
            this.buttonPrintReceipt.el.className = "fa fa-print";
        }
    },
});
