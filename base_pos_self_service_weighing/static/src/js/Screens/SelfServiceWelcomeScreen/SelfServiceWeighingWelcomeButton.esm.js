/** @odoo-module alias=base_pos_self_service_weighing.SelfServiceWeighingWelcomeButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingWelcomeButton extends PosComponent {
    get name() {
        return null;
    }

    get emoji() {
        return null;
    }

    async onClick() {
        await this.showPopup("ErrorPopup", {
            title: this.env._t("Error"),
            body: this.env._t("onClick() Not Implemented"),
        });
    }
}

SelfServiceWeighingWelcomeButton.template = "SelfServiceWeighingWelcomeButton";
Registries.Component.add(SelfServiceWeighingWelcomeButton);
export default SelfServiceWeighingWelcomeButton;
