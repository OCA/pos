/** @odoo-module **/
/* Copyright (C) 2024-Today Dixmit (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async updateModelsData(models_data) {
        console.log(models_data);
        return super.updateModelsData(models_data);
    },
    async _processData(loadedData) {
        await super._processData(...arguments);
        this.product_attribute = loadedData["product.attribute"];
    },
});
