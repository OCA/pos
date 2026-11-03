/** @odoo-module alias=pos_self_service_weighing_product.SelfServiceWeighingProductScreen **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import AbstractSelfServiceWeighingScreen from "base_pos_self_service_weighing.AbstractSelfServiceWeighingScreen";
import {Gui} from "point_of_sale.Gui";
import Registries from "point_of_sale.Registries";
import {browser} from "@web/core/browser/browser";
import {useListener} from "@web/core/utils/hooks";

class SelfServiceWeighingProductScreen extends AbstractSelfServiceWeighingScreen {
    setup() {
        super.setup(...arguments);
        useListener("click-product", this._clickProduct);
    }

    async _weighProduct(product) {
        // Show the ScaleScreen to weigh the product. Since this class
        // inherits from ScaleScreen too (to display the weight in the
        // WeightWidget), we need to stop reading the scale before showing the
        // screen and start again after it has been closed.
        this.onWillUnmount();
        const {confirmed, payload} = await this.showTempScreen(
            "SelfServiceWeighingScaleScreen",
            {
                product,
            }
        );
        // Calling .onMounted() directly here does not work, as the
        // .onWillUnmount() method of the temporary scale screen will be
        // called after this, and the reading of the scale would stop.
        // setTimeout() ensures it is called after. (Maybe there is a cleaner
        // way to do this with Owl?)
        browser.setTimeout(() => {
            this.onMounted();
        });
        let weight = null;
        if (confirmed) {
            weight = payload.weight;
        }
        return {confirmed, weight};
    }

    async _clickProduct(event) {
        const product = event.detail;
        if (!this.env.pos.config.iface_electronic_scale) {
            return Gui.showPopup("ErrorPopup", {
                title: this.env._t("Scale Not Configured"),
                body: this.env._t(
                    "Please configure the scale in the IoT Box section of " +
                        "the Point of Sale configuration."
                ),
            });
        }
        const {confirmed, weight} = await this._weighProduct(product);
        if (!confirmed) {
            return;
        }
        return this.env.pos.print_product_barcode_label(product, weight);
    }
}

SelfServiceWeighingProductScreen.template = "SelfServiceWeighingProductScreen";
Registries.Component.add(SelfServiceWeighingProductScreen);
export default SelfServiceWeighingProductScreen;
