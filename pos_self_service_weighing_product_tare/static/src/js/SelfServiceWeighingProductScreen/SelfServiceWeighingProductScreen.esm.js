/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Registries from "point_of_sale.Registries";
import SelfServiceWeighingProductScreen from "pos_self_service_weighing_product.SelfServiceWeighingProductScreen";

const SelfServiceWeighingProductTareScreen = (SelfServiceWeighingProductScreen_) =>
    class extends SelfServiceWeighingProductScreen_ {
        async _weighProduct(product) {
            const {confirmed, weight: encodedWeight} = await super._weighProduct(
                product
            );
            let weight = encodedWeight;
            if (confirmed) {
                // When pos_tare is installed, weight is an object containing
                // the net weight and the tare.
                weight = weight.weight;
            }
            return {confirmed, weight};
        }
    };

Registries.Component.extend(
    SelfServiceWeighingProductScreen,
    SelfServiceWeighingProductTareScreen
);
export default SelfServiceWeighingProductScreen;
