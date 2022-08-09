/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_barcode.ErrorMultiLotBarcodePopup", function (require) {
    "use strict";

    const ErrorBarcodePopup = require("point_of_sale.ErrorBarcodePopup");
    const Registries = require("point_of_sale.Registries");
    const {_lt} = require("@web/core/l10n/translation");

    class ErrorMultiLotBarcodePopup extends ErrorBarcodePopup {
        get translatedMessage() {
            return this.env._t(this.props.message);
        }
    }
    ErrorMultiLotBarcodePopup.template = "ErrorMultiLotBarcodePopup";
    ErrorMultiLotBarcodePopup.defaultProps = {
        confirmText: _lt("Ok"),
        cancelText: _lt("Cancel"),
        title: _lt("Error"),
        body: "",
        message: _lt(
            "The Point of Sale can not process the scanned barcode, as it matches multiple products:"
        ),
    };

    Registries.Component.add(ErrorMultiLotBarcodePopup);

    return ErrorMultiLotBarcodePopup;
});
