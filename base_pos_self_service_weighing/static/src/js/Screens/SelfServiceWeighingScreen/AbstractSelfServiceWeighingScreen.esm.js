/** @odoo-module alias=base_pos_self_service_weighing.AbstractSelfServiceWeighingScreen **/
// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Registries from "point_of_sale.Registries";
import ScaleScreen from "point_of_sale.ScaleScreen";

class AbstractSelfServiceWeighingScreen extends ScaleScreen {
    _onHotkeys() {
        // Override to ignore ScaleScreen keyboard events.
    }
}

AbstractSelfServiceWeighingScreen.template = "AbstractSelfServiceWeighingScreen";
Registries.Component.add(AbstractSelfServiceWeighingScreen);
export default AbstractSelfServiceWeighingScreen;
