/** @odoo-module */

import {CustomerHistoryScreen} from "@pos_order_line_customer_history/Screens/CustomerHistoryScreen.esm";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        this.HISTORY_SCREEN_STATE = {
            syncedOrderLines: {
                currentPage: 1,
                cache: {},
                toShow: [],
                nPerPage: 80,
                totalCount: null,
                cacheDate: null,
            },
            ui: {
                selectedOrder: null,
                searchDetails: this.getDefaultSearchDetails(),
                filter: null,
            },
        };
    },
    async _loadMissingHistoryProducts(lines) {
        const missingProductIds = new Set([]);
        for (const line of lines) {
            const productId = line.product_id;
            if (missingProductIds.has(productId)) {
                continue;
            }
            if (!this.db.get_product_by_id(productId)) {
                missingProductIds.add(productId);
            }
        }
        if (!missingProductIds.size) {
            return;
        }
        await this._addProducts([...missingProductIds], false);
    },
    showBackButton() {
        return (
            super.showBackButton(...arguments) ||
            this.mainScreen.component === CustomerHistoryScreen
        );
    },
});
