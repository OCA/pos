/** @odoo-module alias=pos_self_service_weighing_product.SelfServiceWeighingScaleScreen **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Registries from "point_of_sale.Registries";
import ScaleScreen from "point_of_sale.ScaleScreen";

const SelfServiceWeighingScaleScreen = (ScaleScreen_) => {
    class SelfServiceWeighingScaleScreen_ extends ScaleScreen_ {
        get productPrice() {
            // This is a modified copy of ScaleScreen.productPrice() to use
            // the display_price instead of the list price.
            const product = this.props.product;
            return (
                (product
                    ? this.env.pos.get_product_unit_display_price(
                          product,
                          this.state.weight
                      )
                    : 0) || 0
            );
        }
        get computedPriceString() {
            const product = this.props.product;
            if (!product) {
                return this.env.pos.format_currency(0);
            }
            const weight = this.state.weight;
            const {display_price} = this.env.pos.compute_product_prices_from_weight(
                product,
                weight
            );
            return this.env.pos.format_currency(display_price);
        }
    }
    SelfServiceWeighingScaleScreen_.template = "SelfServiceWeighingScaleScreen";
    return SelfServiceWeighingScaleScreen_;
};

Registries.Component.addByExtending(SelfServiceWeighingScaleScreen, ScaleScreen);
export default ScaleScreen;
