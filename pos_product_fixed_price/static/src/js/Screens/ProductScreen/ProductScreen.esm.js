/** @odoo-module **/
// SPDX-FileCopyrightText: 2026 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Component} from "point_of_sale.Registries";
import ProductScreen from "point_of_sale.ProductScreen";

const PosProductFixedPriceProductScreen = (OriginalProductScreen) =>
    class extends OriginalProductScreen {
        async _addProduct(product, options) {
            await super._addProduct(product, options);
            if (product.is_pos_price_fix) {
                this.env.pos.numpadMode = "quantity";
            }
        }
    };

Component.extend(ProductScreen, PosProductFixedPriceProductScreen);

export default ProductScreen;
