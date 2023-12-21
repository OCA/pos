/** @odoo-module alias=pos_self_service_weighing_base.SelfServiceWeighingWelcomeScreen **/
// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingWelcomeScreen extends PosComponent {}

SelfServiceWeighingWelcomeScreen.template =
    "pos_self_service_weighing_base.SelfServiceWeighingWelcomeScreen";
Registries.Component.add(SelfServiceWeighingWelcomeScreen);
export default SelfServiceWeighingWelcomeScreen;
