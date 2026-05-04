/** @odoo-module */

import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";

patch(Orderline.props, {
    ...Orderline.props,
    hidePriceState: {type: Object, optional: true},
});
patch(Orderline.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos = usePos();
        this.order = this.pos.get_order();
    },
    get priceHidden() {
        return this.order?.hidePriceOrder ?? false;
    },
});
