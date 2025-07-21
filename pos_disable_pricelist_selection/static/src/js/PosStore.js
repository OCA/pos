/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {PosStore} from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async loadServerData(...args) {
        await super.loadServerData(...args);

        const {config, pricelists_by_id} = this;
        const initialConfigPricelist = pricelists_by_id[config.pricelist_id?.[0]];

        if (!config.use_pricelist || config.hide_pricelist_button) {
            this.pricelists = initialConfigPricelist ? [initialConfigPricelist] : [];
            this.selectable_pricelists = initialConfigPricelist
                ? [initialConfigPricelist]
                : [];
            this.pos.selectable_pricelists = this.selectable_pricelists;
        }

        if (initialConfigPricelist) {
            this.set_pricelist(initialConfigPricelist);
        } else if (this.default_pricelist) {
            this.set_pricelist(this.default_pricelist);
        } else if (this.pricelists.length > 0) {
            this.set_pricelist(this.pricelists[0]);
        } else {
            this.set_pricelist(null);
        }
    },
});
