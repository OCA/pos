/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {ConnectionLostError} from "@web/core/network/rpc_service";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {OfflineErrorPopup} from "@point_of_sale/app/errors/popups/offline_error_popup";
import {Orderline} from "@point_of_sale/app/store/models";
import {_t} from "@web/core/l10n/translation";

import {patch} from "@web/core/utils/patch";

patch(Orderline.prototype, {
    async setPackLotLines({modifiedPackLotLines, newPackLotLines}) {
        if (
            this.product.use_expiration_date &&
            this.env.services.pos.config.check_lot_expiry
        ) {
            var lotsToCheck = [];
            for (const newLotLine of newPackLotLines) {
                lotsToCheck.push(newLotLine.lot_name);
            }
            for (const modifiedLotline of Object.values(modifiedPackLotLines)) {
                lotsToCheck.push(modifiedLotline);
            }
            try {
                const checked_lots_problem = await this.env.services.orm.call(
                    "product.product",
                    "check_pos_lots",
                    [[this.product.id], lotsToCheck, this.env.services.pos.company.id]
                );
                if (checked_lots_problem) {
                    await this.env.services.popup.add(ErrorPopup, {
                        title: _t("Problem with lots"),
                        body:
                            checked_lots_problem + " " + _t("No changes were applied."),
                    });
                    // We don't want to apply the changes in this case
                    return;
                }
            } catch (error) {
                if (error instanceof ConnectionLostError) {
                    this.env.services.popup.add(OfflineErrorPopup);
                } else {
                    throw error;
                }
            }
        }
        return await super.setPackLotLines(...arguments);
    },
});
