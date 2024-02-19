/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
import {Orderline, Product} from "@point_of_sale/app/store/models";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {_t} from "@web/core/l10n/translation";

import {patch} from "@web/core/utils/patch";

patch(Product.prototype, {
    async checkProductLotExpiration(lot) {
        const lotData = this.available_lot_for_pos_ids.filter((availableLot) => {
            return lot === availableLot.name;
        });
        if (lotData.length === 0) {
            await this.env.services.popup.add(ErrorPopup, {
                title: _t("Problem with lots"),
                body: _t("A lot was not found. No changes were applied."),
            });
            return true;
        }
        if (new Date(lotData[0].expiration_date) < new Date()) {
            await this.env.services.popup.add(ErrorPopup, {
                title: _t("Problem with lots"),
                body: _t(
                    "A lot is expired and you are not enabled to sell expired lots. No changes were applied."
                ),
            });
            return true;
        }
        return false;
    },
});

patch(Orderline.prototype, {
    async setPackLotLines({modifiedPackLotLines, newPackLotLines}) {
        if (
            this.product.use_expiration_date &&
            this.env.services.pos.config.check_lot_expiry
        ) {
            for (const newLotLine of newPackLotLines) {
                if (await this.product.checkProductLotExpiration(newLotLine.lot_name)) {
                    return;
                }
            }
            for (const modifiedLotline of Object.values(modifiedPackLotLines)) {
                if (await this.product.checkProductLotExpiration(modifiedLotline)) {
                    return;
                }
            }
        }
        return await super.setPackLotLines(...arguments);
    },
});
