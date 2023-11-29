/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {EditListPopup} from "@point_of_sale/app/store/select_lot_popup/select_lot_popup";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/barcode/barcode_reader_hook";

patch(EditListPopup.prototype, {
    setup() {
        super.setup(...arguments);
        useBarcodeReader(
            {
                lot: this._lotScanned,
            },
            true
        );
    },

    _lotScanned(code) {
        // Check we are on lot/SN selection popup
        if (this.props.title === _t("Lot/Serial Number(s) Required")) {
            this.state.array.push({text: code.code, _id: this._nextId()});
            this.confirm();
        }
    },
});
