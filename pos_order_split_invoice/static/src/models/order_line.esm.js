/** @odoo-module **/

import {Orderline} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";
const {DateTime} = luxon;

patch(Orderline.prototype, {
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.split_invoice_amount = this.split_invoice_amount(
            this.order.pricelist,
            this.quantity
        );
        return json;
    },
    split_invoice_amount(pricelist, quantity, price_extra = 0, recurring = false) {
        if (pricelist === undefined) {
            return 0;
        }
        const date = DateTime.now();
        const rules = (
            this.product.applicablePricelistItems[pricelist.id] || []
        ).filter((item) => this.product.isPricelistItemUsable(item, date));
        const rule = rules.find(
            (check_rule) =>
                !check_rule.min_quantity || quantity >= check_rule.min_quantity
        );
        if (rule && rule.compute_price === "split") {
            let price = this.product.lst_price + (price_extra || 0);
            if (rule.split_base === "pricelist") {
                const base_pricelist = this.pos.pricelists.find(
                    (pricelist) => pricelist.id === rule.split_base_pricelist_id[0]
                );
                if (base_pricelist) {
                    price = this.product.get_price(
                        base_pricelist,
                        quantity,
                        price_extra,
                        recurring
                    );
                }
            } else if (rule.base === "standard_price") {
                price = this.standard_price;
            }
            return (price * rule.split_percentage) / 100;
        }
        return 0;
    },
});
