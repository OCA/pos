/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {PosStore} from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async _processData(loadedData) {
        await super._processData(loadedData);

        if (!this.config || !this.pricelists) {
            console.error(
                "POS Custom Pricelist: 'this.config' or 'this.pricelists' are not available after _processData. Skipping custom logic."
            );
            return;
        }

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
        const posService = this.env && this.env.services && this.env.services.pos;
        const setPricelistViaService =
            posService && typeof posService.set_pricelist === "function"
                ? posService.set_pricelist.bind(posService)
                : null;

        if (initialConfigPricelist) {
            if (setPricelistMethod) {
                setPricelistMethod(initialConfigPricelist);
            } else if (setPricelistViaService) {
                setPricelistViaService(initialConfigPricelist);
            } else {
                console.warn(
                    "POS Custom Pricelist: set_pricelist method not found via 'this' or 'pos' service for initial config pricelist."
                );
            }
        } else if (this.default_pricelist) {
            if (setPricelistMethod) {
                setPricelistMethod(this.default_pricelist);
            } else if (setPricelistViaService) {
                setPricelistViaService(this.default_pricelist);
            } else {
                console.warn(
                    "POS Custom Pricelist: set_pricelist method not found via 'this' or 'pos' service for default pricelist."
                );
            }
        } else if (this.pricelists.length) {
            if (setPricelistMethod) {
                setPricelistMethod(this.pricelists[0]);
            } else if (setPricelistViaService) {
                setPricelistViaService(this.pricelists[0]);
            } else {
                console.warn(
                    "POS Custom Pricelist: set_pricelist method not found via 'this' or 'pos' service for first available pricelist."
                );
            }
        } else {
            if (setPricelistMethod) {
                setPricelistMethod(null);
            } else if (setPricelistViaService) {
                setPricelistViaService(null);
            } else {
                console.warn(
                    "POS Custom Pricelist: set_pricelist method not found via 'this' or 'pos' service for null pricelist."
                );
            }
        }

        console.log(
            "POS Custom Pricelist: Logic applied successfully via _processData."
        );
    },
});
