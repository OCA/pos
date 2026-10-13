/*
  Copyright 2019 Coop IT Easy SCRLfs
    Robin Keunen <robin@coopiteasy.be>
    Simon Hick <simon.hick@coopiteasy.be>
  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async pay() {
        if (this.config.require_product_quantity) {
            const linesWithoutQty = this.get_order().lines.filter(
                (line) => line.qty === 0
            );
            if (linesWithoutQty.length > 0) {
                await new Promise((resolve) => {
                    this.dialog.add(ConfirmationDialog, {
                        title: _t("Missing quantities"),
                        body:
                            _t("No quantity set for products:") +
                            "\n" +
                            linesWithoutQty
                                .map((line) => " - " + line.product_id.display_name)
                                .join("\n"),
                        confirm: resolve,
                    });
                });
                return;
            }
        }
        return super.pay(...arguments);
    },
});
