/** @odoo-module */

import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async _processData(loadedData) {
        await super._processData(...arguments);
        this.foreign_currencies = loadedData["pos.foreign.currency"] || [];
        this.foreignCurrencyById = Object.fromEntries(
            this.foreign_currencies.map((currency) => [currency.id, currency])
        );
        this.cash_control_method_id = loadedData.pos_cash_control_method_id || false;
    },
});
