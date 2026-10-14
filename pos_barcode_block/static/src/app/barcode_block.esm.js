/** @odoo-module */
import {patch} from "@web/core/utils/patch";
import {_t} from "@web/core/l10n/translation";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";

patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        const reader = this.barcodeReader;
        this._barcodeBlocked = false;

        const originalScan = reader.scan.bind(reader);
        reader.scan = async (code) => {
            if (this._barcodeBlocked) {
                return;
            }
            return originalScan(code);
        };

        reader.showNotFoundNotification = (code) => {
            this._barcodeBlocked = true;
            this.dialog.add(
                AlertDialog,
                {
                    title: _t("Unknown Barcode"),
                    body: _t(
                        "No product found associated with code: %s",
                        code?.base_code || code?.code || code
                    ),
                },
                {onClose: () => (this._barcodeBlocked = false)}
            );
        };
    },
});
