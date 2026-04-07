/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {Order, Orderline} from "@point_of_sale/app/store/models";

patch(Orderline.prototype, {
    getDisplayData() {
        return {
            ...super.getDisplayData(),
            productId: this.product.id,
        };
    },
});

patch(Order.prototype, {
    setup() {
        super.setup(...arguments);
        this.customerBuyProductIDS = [];
    },

    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        if (json.partner_id) {
            this.setCustomerBuyProductIDS(json.partner_id);
        }
    },

    async set_partner(partner) {
        await super.set_partner(partner);
        const partner_id = partner?.id || false;
        await this.setCustomerBuyProductIDS(partner_id);
    },

    isBuyProduct(product_id) {
        return this.customerBuyProductIDS.includes(product_id);
    },

    async setCustomerBuyProductIDS(partner_id) {
        if (partner_id) {
            this.customerBuyProductIDS = await this.pos.env.services.orm.call(
                "pos.order.line",
                "get_customer_buy_product_ids",
                [],
                {partner_id}
            );
        } else {
            this.customerBuyProductIDS = [];
        }

        // Trigger a product list refresh by toggling search term
        const oldSearchWord = this.pos.searchProductWord;
        this.pos.searchProductWord = " ";
        this.pos.searchProductWord = oldSearchWord;
    },
});
