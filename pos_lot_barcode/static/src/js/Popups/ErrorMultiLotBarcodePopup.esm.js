/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
import {ErrorBarcodePopup} from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";
import {_lt} from "@web/core/l10n/translation";

export class ErrorMultiLotBarcodePopup extends ErrorBarcodePopup {}
ErrorMultiLotBarcodePopup.template = "pos_lot_barcode.ErrorMultiLotBarcodePopup";
ErrorMultiLotBarcodePopup.defaultProps = {
    confirmText: _lt("Ok"),
    cancelText: _lt("Cancel"),
    title: _lt("Error"),
    body: "",
    message: _lt(
        "The Point of Sale can not process the scanned barcode, as it matches multiple products:"
    ),
};
