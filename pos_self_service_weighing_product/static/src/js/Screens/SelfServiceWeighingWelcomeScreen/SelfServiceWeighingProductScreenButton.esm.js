/** @odoo-module alias=pos_self_service_weighing_product.SelfServiceWeighingProductScreenButton **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import SelfServiceWeighingWelcomeButton from "base_pos_self_service_weighing.SelfServiceWeighingWelcomeButton";

class SelfServiceWeighingProductScreenButton extends SelfServiceWeighingWelcomeButton {
    get name() {
        return this.env._t("Weigh Products");
    }

    get emoji() {
        return "🍐";
    }

    async onClick() {
        Gui.showScreen("SelfServiceWeighingProductScreen");
    }
}

Registries.Component.add(SelfServiceWeighingProductScreenButton);
export default SelfServiceWeighingProductScreenButton;
