/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingTareScreen **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import AbstractSelfServiceWeighingScreen from "pos_self_service_weighing_base.AbstractSelfServiceWeighingScreen";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingTareScreen extends AbstractSelfServiceWeighingScreen {}

SelfServiceWeighingTareScreen.template =
    "pos_self_service_weighing_tare.SelfServiceWeighingTareScreen";
Registries.Component.add(SelfServiceWeighingTareScreen);
export default SelfServiceWeighingTareScreen;
