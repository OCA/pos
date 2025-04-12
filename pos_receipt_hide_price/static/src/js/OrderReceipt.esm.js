/** @odoo-module */

import {OrderReceipt} from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import {patch} from "@web/core/utils/patch";

// Patch the static props to include priceHidden
patch(OrderReceipt, {
    props: {
        ...OrderReceipt.props,
        priceHidden: {type: Boolean, optional: true},
    },
});
