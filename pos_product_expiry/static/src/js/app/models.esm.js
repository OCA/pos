/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {rpc} from "@web/core/network/rpc";
import {ProductProduct} from "@point_of_sale/app/models/product_product";
import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {PosData} from "@point_of_sale/app/models/data_service";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosData.prototype, {
    async setup(env, {dialog}) {
        await super.setup(...arguments);
        this.models.dialog = dialog;
    },
});

patch(ProductProduct.prototype, {
    async checkProductLotExpiration(lot, company) {
        const lotData = await rpc("/web/dataset/call_kw", {
            model: "stock.lot",
            method: "search_read",
            args: [
                [
                    "|",
                    ["company_id", "=", false],
                    ["company_id", "=", company.id],
                    ["product_id", "=", this.id],
                    ["name", "=", lot],
                ],
            ],
            kwargs: {
                fields: ["id", "expiration_date"],
            },
        });

        if (lotData.length === 0) {
            await this.models.dialog?.add(AlertDialog, {
                title: _t("Problem with lots"),
                body: _t("A lot was not found. No changes were applied."),
            });
            return true;
        }
        // Odoo returns expiration_date as UTC ("YYYY-MM-DD HH:MM:SS") with no timezone suffix.
        // Normalize to ISO 8601 UTC by replacing the space with "T" and appending "Z",
        // so new Date() parses it as UTC consistently across all browsers.
        const expiryDate = new Date(lotData[0].expiration_date.replace(" ", "T") + "Z");
        if (expiryDate < new Date()) {
            await this.models.dialog?.add(AlertDialog, {
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

patch(PosOrderline.prototype, {
    async setPackLotLines({modifiedPackLotLines, newPackLotLines}) {
        if (this.product_id.use_expiration_date && this.config.check_lot_expiry) {
            for (const newLotLine of newPackLotLines) {
                if (
                    await this.product_id.checkProductLotExpiration(
                        newLotLine.lot_name,
                        this.company
                    )
                ) {
                    return;
                }
            }
            for (const modifiedLotline of Object.values(modifiedPackLotLines)) {
                if (
                    await this.product_id.checkProductLotExpiration(
                        modifiedLotline,
                        this.company
                    )
                ) {
                    return;
                }
            }
        }
        return await super.setPackLotLines(...arguments);
    },
});
