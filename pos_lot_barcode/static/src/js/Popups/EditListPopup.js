/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_barcode.EditListPopup", function (require) {
    "use strict";

    const EditListPopup = require("point_of_sale.EditListPopup");
    const Registries = require("point_of_sale.Registries");
    const {useBarcodeReader} = require("point_of_sale.custom_hooks");

    const PosLotBarcodeEditListPopup = (EditListPopup) =>
        class extends EditListPopup {
            setup() {
                super.setup();
                useBarcodeReader({
                    lot: this._lotScanned,
                });
            }
            _lotScanned(code) {
                // Check we are on lot/SN selection popup
                if (this.props.title === this.env._t("Lot/Serial Number(s) Required")) {
                    this.state.array.push({text: code.code, _id: this._nextId()});
                    this.confirm();
                }
            }
        };
    Registries.Component.extend(EditListPopup, PosLotBarcodeEditListPopup);
    return EditListPopup;
});
