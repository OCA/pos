/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {SelectLotPopup} from "@point_of_sale/app/components/popups/select_lot_popup/select_lot_popup";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useBarcodeReader} from "@point_of_sale/app/hooks/barcode_reader_hook";

patch(SelectLotPopup.prototype, {
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
        // Ensure we’re on the correct popup
        if (this.props.title === _t("Lot/Serial number(s) required for")) {
            const current = this.state.values || [];

            const newValues = [
                ...current,
                {
                    text: code.code,
                    id: this._nextId(),
                },
            ];

            this.state = {
                ...this.state,
                values: newValues,
            };
            this.confirm();
        }
    },
});
