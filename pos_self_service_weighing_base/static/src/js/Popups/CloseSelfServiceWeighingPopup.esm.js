/** @odoo-module alias=pos_self_service_weighing_base.CloseSelfServiceWeighingPopup **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import ClosePosPopup from "point_of_sale.ClosePosPopup";
import Registries from "point_of_sale.Registries";

class CloseSelfServiceWeighingPopup extends ClosePosPopup {}

CloseSelfServiceWeighingPopup.template =
    "pos_self_service_weighing_base.CloseSelfServiceWeighingPopup";
Registries.Component.add(CloseSelfServiceWeighingPopup);
export default CloseSelfServiceWeighingPopup;
