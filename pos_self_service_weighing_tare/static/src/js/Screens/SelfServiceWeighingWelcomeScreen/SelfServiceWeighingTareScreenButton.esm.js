/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingTareScreenButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingWelcomeButton from "pos_self_service_weighing_base.SelfServiceWeighingWelcomeButton";

class SelfServiceWeighingTareScreenButton extends SelfServiceWeighingWelcomeButton {
    get name() {
        return "Print Tare Labels";
    }

    get faSymbol() {
        return "fa-barcode";
    }

    async _onClick() {
        Gui.showScreen("SelfServiceWeighingTareScreen");
    }
}

SelfServiceWeighingTareScreenButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingWelcomeButton";
Registries.Component.add(SelfServiceWeighingTareScreenButton);
export default SelfServiceWeighingTareScreenButton;
