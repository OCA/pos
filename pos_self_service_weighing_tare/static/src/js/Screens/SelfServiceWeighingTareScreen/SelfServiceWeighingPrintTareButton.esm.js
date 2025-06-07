/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingPrintTareButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Registries from "point_of_sale.Registries";
import SelfServiceWeighingControlButton from "base_pos_self_service_weighing.SelfServiceWeighingControlButton";

class SelfServiceWeighingPrintTareButton extends SelfServiceWeighingControlButton {
    get name() {
        return this.env._t("Print Label");
    }

    get faSymbol() {
        return "fa-print";
    }

    async onClick() {
        return this.env.pos.print_tare_barcode_label(this.props.weight);
    }
}

Registries.Component.add(SelfServiceWeighingPrintTareButton);
export default SelfServiceWeighingPrintTareButton;
