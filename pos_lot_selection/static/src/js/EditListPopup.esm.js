/** @odoo-module */
/*
    Copyright 2023 Dixmit
    Copyright 2022 Camptocamp
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {onWillStart, useState} from "@odoo/owl";
import {ConnectionLostError} from "@web/core/network/rpc_service";
import {EditListInput} from "@point_of_sale/app/store/select_lot_popup/edit_list_input/edit_list_input";
import {EditListPopup} from "@point_of_sale/app/store/select_lot_popup/select_lot_popup";

import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(EditListInput.prototype, {
    get_lot_name(lot) {
        return lot.name;
    },
});
patch(EditListPopup.prototype, {
    setup() {
        super.setup();
        this.data = useState({
            lots: this.env.services.pos.selectedProduct.available_lot_for_pos_ids,
        });
        onWillStart(this.onWillStart);
    },
    async onWillStart() {
        if (this.props.title === _t("Lot/Serial Number(s) Required")) {
            // We keep this in order to ensure that this call is only done
            // when we add a serial
            try {
                const lots = await this.env.services.orm.call(
                    "product.product",
                    "get_available_lots_for_pos",
                    [
                        [this.env.services.pos.selectedProduct.id],
                        this.env.services.pos.company.id,
                    ]
                );
                this.data.lots = lots;
                this.env.services.pos.selectedProduct.available_lot_for_pos_ids = lots;
            } catch (error) {
                if (error instanceof ConnectionLostError) {
                    return;
                }
                throw error;
            }
        }
    },
});
