import {OrderSummary} from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import {patch} from "@web/core/utils/patch";
import {_t} from "@web/core/l10n/translation";

patch(OrderSummary.prototype, {
    getTotalQuantity() {
        const selectedOrder = this.pos.selectedOrder;
        return (
            _t("Number of articles") +
            ": " +
            selectedOrder.lines.reduce((total, line) => total + line.qty, 0)
        );
    },
});
