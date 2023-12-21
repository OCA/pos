/** @odoo-module alias=pos_self_service_weighing_base.SelfServiceWeighingHomeButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingControlButton from "pos_self_service_weighing_base.SelfServiceWeighingControlButton";
import {useListener} from "@web/core/utils/hooks";

class SelfServiceWeighingHomeButton extends SelfServiceWeighingControlButton {
    get name() {
        return "Home";
    }

    get faSymbol() {
        return "fa-home";
    }

    setup() {
        super.setup();
        useListener("click", this._onClick);
    }

    async _onClick() {
        Gui.showScreen("SelfServiceWeighingWelcomeScreen");
    }
}

SelfServiceWeighingHomeButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingControlButton";
Registries.Component.add(SelfServiceWeighingHomeButton);
export default SelfServiceWeighingHomeButton;
