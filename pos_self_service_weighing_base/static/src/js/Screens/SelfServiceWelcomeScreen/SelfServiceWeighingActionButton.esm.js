/** @odoo-module alias=pos_self_service_weighing_base.SelfServiceWeighingActionButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";
import {useListener} from "@web/core/utils/hooks";

class SelfServiceWeighingActionButton extends PosComponent {
    get name() {
        return "Base Action";
    }

    get faSymbol() {
        return "fa-barcode";
    }

    setup() {
        super.setup();
        useListener("click", this._onClick);
    }

    async _onClick() {
        Gui.showScreen("AbstractSelfServiceWeighingScreen");
    }
}

SelfServiceWeighingActionButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingActionButton";
Registries.Component.add(SelfServiceWeighingActionButton);
export default SelfServiceWeighingActionButton;
