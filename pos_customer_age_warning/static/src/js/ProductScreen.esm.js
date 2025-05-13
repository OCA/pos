/** @odoo-module */

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    async _barcodePartnerAction(code) {
        const partner = await this._getPartnerByBarcode(code);
        if (partner) {
            await this.pos.ageRestrictionDialog(partner);
        }
        return super._barcodePartnerAction(code);
    },
});
