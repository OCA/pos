/** @odoo-module */

import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useState} from "@odoo/owl";

patch(ReceiptScreen.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
        this.hidePriceState = useState({priceHidden: false});
        this.order = this.pos.get_order();
        this.start = !this.order.hidePriceOrder;
    },
    hidePrice() {
        this.order.hidePriceOrder = this.start
            ? !this.hidePriceState.priceHidden
            : this.hidePriceState.priceHidden;
        this.hidePriceState.priceHidden = this.order.hidePriceOrder;
        this.start = true;
    },
    get priceHidden() {
        return this.order?.hidePriceOrder ?? this.hidePriceState?.priceHidden;
    },
});
