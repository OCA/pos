/** @odoo-module */
import {SaleOrderList} from "@pos_sale/app/order_management_screen/sale_order_list/sale_order_list";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";

patch(SaleOrderList.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },
    get showPrint() {
        return this.pos.config.print_sales_order_ids.length > 0;
    },
});
