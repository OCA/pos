/** @odoo-module alias=pos_self_service_weighing_base.AbstractSelfServiceWeighingScreen **/
// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

class AbstractSelfServiceWeighingScreen extends PosComponent {}

AbstractSelfServiceWeighingScreen.template =
    "pos_self_service_weighing_base.AbstractSelfServiceWeighingScreen";
Registries.Component.add(AbstractSelfServiceWeighingScreen);
export default AbstractSelfServiceWeighingScreen;
