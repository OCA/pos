/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingTareScreenButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingWelcomeButton from "base_pos_self_service_weighing.SelfServiceWeighingWelcomeButton";
import {_t} from "web.core";

class SelfServiceWeighingTareScreenButton extends SelfServiceWeighingWelcomeButton {
    get name() {
        return _t("Print Tare Labels");
    }

    get faSymbol() {
        return "fa-barcode";
    }

    async onClick() {
        Gui.showScreen("SelfServiceWeighingTareScreen");
    }
}

SelfServiceWeighingTareScreenButton.template =
    "base_pos_self_service_weighing.SelfServiceWeighingWelcomeButton";
Registries.Component.add(SelfServiceWeighingTareScreenButton);
export default SelfServiceWeighingTareScreenButton;
