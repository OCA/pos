/** @odoo-module alias=pos_self_service_weighing_tare.SelfServiceWeighingBarcodePopup **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";

class SelfServiceWeighingBarcodePopup extends AbstractAwaitablePopup {}

SelfServiceWeighingBarcodePopup.template =
    "pos_self_service_weighing_tare.SelfServiceWeighingBarcodePopup";
Registries.Component.add(SelfServiceWeighingBarcodePopup);
export default SelfServiceWeighingBarcodePopup;
