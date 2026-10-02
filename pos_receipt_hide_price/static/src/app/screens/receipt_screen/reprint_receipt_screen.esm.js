/** @odoo-module */

import {ReprintReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/reprint_receipt_screen";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useState} from "@odoo/owl";

patch(ReprintReceiptScreen.prototype, {
    setup() {
        super.setup();
        this.hidePriceState = useState({priceHidden: false});
        this.pos = usePos();
        this.order = this.pos.get_order();
    },
    hidePrice() {
        this.hidePriceState.priceHidden = !this.hidePriceState.priceHidden;
        this.order.hidePriceOrder = this.hidePriceState.priceHidden;
    },
    get priceHidden() {
        return this.order?.hidePriceOrder ?? this.hidePriceState?.priceHidden;
    },
});
