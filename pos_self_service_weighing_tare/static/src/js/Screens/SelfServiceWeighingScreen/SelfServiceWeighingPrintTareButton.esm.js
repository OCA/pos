/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingPrintTareButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Registries from "point_of_sale.Registries";
import SelfServiceWeighingControlButton from "pos_self_service_weighing_base.SelfServiceWeighingControlButton";

class SelfServiceWeighingPrintTareButton extends SelfServiceWeighingControlButton {
    get name() {
        return "Print Tare Label";
    }

    get faSymbol() {
        return "fa-barcode";
    }

    async _onClick() {
        const barcode = "1234567890";
        this.showPopup("SelfServiceWeighingBarcodePopup", {
            barcode: barcode,
            keepBehind: true,
        });
    }
}

SelfServiceWeighingPrintTareButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingControlButton";
Registries.Component.add(SelfServiceWeighingPrintTareButton);
export default SelfServiceWeighingPrintTareButton;
