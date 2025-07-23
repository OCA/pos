/** @odoo-module **/

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async _processData(loadedData) {
        await super._processData(loadedData);

        if (!this.config || !this.pricelists) return;

        this.pricelists_by_id = {};
        for (const pricelist of this.pricelists) {
            this.pricelists_by_id[pricelist.id] = pricelist;
        }

        const config = this.config;
        const pricelists_by_id = this.pricelists_by_id;
        const initialConfigPricelist = pricelists_by_id[config.pricelist_id?.[0]];
        const selected_ids = config.selectable_pricelist_ids || [];
        const availablePricelists = selected_ids.length
            ? selected_ids.map((id) => pricelists_by_id[id]).filter(Boolean)
            : Object.values(pricelists_by_id);

        if (!config.use_pricelist || config.hide_pricelist_button) {
            this.pricelists = initialConfigPricelist ? [initialConfigPricelist] : [];
            this.selectable_pricelists = [];
        } else {
            this.pricelists = availablePricelists;
            this.selectable_pricelists = availablePricelists;
        }

        const setPricelistMethod =
            typeof this.set_pricelist === "function"
                ? this.set_pricelist.bind(this)
                : null;
        const posService = this.env?.services?.pos;
        const setPricelistViaService =
            typeof posService?.set_pricelist === "function"
                ? posService.set_pricelist.bind(posService)
                : null;

        const pricelistToSet =
            initialConfigPricelist ||
            this.default_pricelist ||
            this.pricelists[0] ||
            null;

        if (setPricelistMethod) {
            setPricelistMethod(pricelistToSet);
        } else if (setPricelistViaService) {
            setPricelistViaService(pricelistToSet);
        }
    },
});
