/** @odoo-module */

import {OrderWidget} from "@point_of_sale/app/generic_components/order_widget/order_widget";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {_t} from "@web/core/l10n/translation";

patch(OrderWidget.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },
    getOrderName() {
        return _t("Order") + ": " + this.pos.get_order().uid;
    },
});
