/** @odoo-module alias=base_pos_self_service_weighing.SelfServiceWeighingHomeButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingControlButton from "base_pos_self_service_weighing.SelfServiceWeighingControlButton";

class SelfServiceWeighingHomeButton extends SelfServiceWeighingControlButton {
    get name() {
        return this.env._t("Home");
    }

    get faSymbol() {
        return "fa-home";
    }

    async onClick() {
        Gui.showScreen("SelfServiceWeighingWelcomeScreen");
    }
}

Registries.Component.add(SelfServiceWeighingHomeButton);
export default SelfServiceWeighingHomeButton;
