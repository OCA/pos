/** @odoo-module alias=pos_self_service_weighing_base.SelfServiceWeighingDebugButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingWelcomeButton from "./SelfServiceWeighingWelcomeButton.esm";
import {_t} from "web.core";
import {useListener} from "@web/core/utils/hooks";

class SelfServiceWeighingDebugButton extends SelfServiceWeighingWelcomeButton {
    get name() {
        return _t("Base Action");
    }

    get faSymbol() {
        return "fa-barcode";
    }

    setup() {
        super.setup();
        useListener("click", this.onClick);
    }

    async onClick() {
        Gui.showScreen("AbstractSelfServiceWeighingScreen");
    }
}

SelfServiceWeighingDebugButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingWelcomeButton";
Registries.Component.add(SelfServiceWeighingDebugButton);
export default SelfServiceWeighingDebugButton;
