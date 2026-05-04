/** @odoo-module */

import {OrderReceipt} from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import {patch} from "@web/core/utils/patch";

patch(OrderReceipt.props, {
    ...OrderReceipt.props,
    hidePriceState: {type: Object, optional: true},
});

patch(OrderReceipt.prototype, {
    setup() {
        super.setup(...arguments);
        this.hidePriceState = this.props.hidePriceState;
        this.start = false;
    },
    get priceHidden() {
        if (
            this.hidePriceState === undefined &&
            this.props.data.hidePriceOrder === null
        ) {
            return document.querySelector("button.price_hidden i.fa-eye");
        }
        if (this.props.data === undefined || this.props.data.hidePriceOrder === null) {
            return document.querySelector("button.price_hidden i.fa-eye-slash");
        }
        return this.props.data?.hidePriceOrder ?? false;
    },
});
