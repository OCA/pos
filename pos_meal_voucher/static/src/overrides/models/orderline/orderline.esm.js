import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {patch} from "@web/core/utils/patch";

const RECEIPT_ORDER_LINE_PREFIX = "(*) ";

patch(PosOrderline.prototype, {
    getDisplayData() {
        return {
            ...super.getDisplayData(),
            displayMealVoucherIcon: this.get_display_meal_voucher_icon(),
        };
    },
    get_display_meal_voucher_icon() {
        return (
            this.config.enable_meal_voucher_order_lines_icon &&
            this.product_id.meal_voucher_ok
        );
    },
    get_full_product_name() {
        const productName = super.get_full_product_name();
        if (
            !this.product_id.meal_voucher_ok ||
            !this.config.enable_meal_voucher_receipt_info
        ) {
            return productName;
        }
        return RECEIPT_ORDER_LINE_PREFIX + productName;
    },
});

patch(Orderline, {
    props: {
        ...Orderline.props,
        line: {
            ...Orderline.props.line,
            shape: {
                ...Orderline.props.line.shape,
                displayMealVoucherIcon: {type: Boolean, optional: true},
            },
        },
    },
});
