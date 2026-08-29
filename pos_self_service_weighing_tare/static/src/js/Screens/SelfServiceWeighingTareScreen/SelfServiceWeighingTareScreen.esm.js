/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingTareScreen **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import AbstractSelfServiceWeighingScreen from "base_pos_self_service_weighing.AbstractSelfServiceWeighingScreen";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingTareScreen extends AbstractSelfServiceWeighingScreen {
    get uom_id() {
        return this.env.pos.tare_uom_id;
    }

    get decimal_places() {
        return this.env.pos.tare_decimal_places;
    }
}

SelfServiceWeighingTareScreen.template = "SelfServiceWeighingTareScreen";
Registries.Component.add(SelfServiceWeighingTareScreen);
export default SelfServiceWeighingTareScreen;
