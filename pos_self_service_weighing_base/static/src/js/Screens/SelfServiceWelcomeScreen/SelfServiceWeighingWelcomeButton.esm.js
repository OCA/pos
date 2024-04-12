/** @odoo-module alias=pos_self_service_weighing_base.SelfServiceWeighingWelcomeButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";
import {useListener} from "@web/core/utils/hooks";

class SelfServiceWeighingWelcomeButton extends PosComponent {
    get name() {
        return null;
    }

    get faSymbol() {
        return null;
    }

    setup() {
        super.setup();
        useListener("click", this.onClick);
    }

    async onClick() {
        await this.showPopup("ErrorPopup", {
            title: "Error",
            body: "onClick Not Implemented",
        });
    }
}

SelfServiceWeighingWelcomeButton.template =
    "pos_self_service_weighing_base.SelfServiceWeighingWelcomeButton";
Registries.Component.add(SelfServiceWeighingWelcomeButton);
export default SelfServiceWeighingWelcomeButton;
