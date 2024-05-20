/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License OPL-1.0 or later (https://www.odoo.com/documentation/15.0/es/legal/licenses.html#odoo-apps).
*/

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async getProductInfo(product, quantity) {
        const order = this.get_order();
        const rules = order.pricelist
            ? (product.applicablePricelistItems[order.pricelist.id] || []).filter(
                  (item) => product.isPricelistItemUsable(item, order.date_order)
              )
            : [];
        const rule = rules.find((r) => !r.min_quantity || quantity >= r.min_quantity);
        if (rule && rule.compute_price === "split") {
            const productInfo = await this.orm.call(
                "product.product",
                "get_product_info_pos",
                [
                    [product.id],
                    product.get_price(
                        this.pricelists.find(
                            (pricelist) => pricelist.id === rule.base_pricelist_id[0]
                        ),
                        quantity
                    ),
                    quantity,
                    this.config.id,
                ]
            );

            const priceWithoutTax = productInfo.all_prices.price_without_tax;
            const margin = priceWithoutTax - product.standard_price;
            const orderPriceWithoutTax = order.get_total_without_tax();
            const orderCost = order.get_total_cost();
            const orderMargin = orderPriceWithoutTax - orderCost;

            const costCurrency = this.env.utils.formatCurrency(product.standard_price);
            const marginCurrency = this.env.utils.formatCurrency(margin);
            const marginPercent = priceWithoutTax
                ? Math.round((margin / priceWithoutTax) * 10000) / 100
                : 0;
            const orderPriceWithoutTaxCurrency =
                this.env.utils.formatCurrency(orderPriceWithoutTax);
            const orderCostCurrency = this.env.utils.formatCurrency(orderCost);
            const orderMarginCurrency = this.env.utils.formatCurrency(orderMargin);
            const orderMarginPercent = orderPriceWithoutTax
                ? Math.round((orderMargin / orderPriceWithoutTax) * 10000) / 100
                : 0;
            return {
                costCurrency,
                marginCurrency,
                marginPercent,
                orderPriceWithoutTaxCurrency,
                orderCostCurrency,
                orderMarginCurrency,
                orderMarginPercent,
                productInfo,
            };
        }
        return await super.getProductInfo(product, quantity);
    },
});
