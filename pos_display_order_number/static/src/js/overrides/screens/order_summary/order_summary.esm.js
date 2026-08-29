import {OrderSummary} from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import {patch} from "@web/core/utils/patch";
import {_t} from "@web/core/l10n/translation";

patch(OrderSummary.prototype, {
    getOrderName() {
        const selectedOrder = this.pos.selectedOrder;
        return _t("Order") + ": " + selectedOrder.pos_reference;
    },
});
