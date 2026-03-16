/** @odoo-module **/
// SPDX-FileCopyrightText: 2026 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// import {Gui} from "point_of_sale.Gui";
import {Order, Orderline} from "point_of_sale.models";
import {Gui} from "point_of_sale.Gui";
import {Model} from "point_of_sale.Registries";
import {_t} from "web.core";

const PosProductFixedPriceOrderline = (OriginalOrderline) =>
    class extends OriginalOrderline {
        set_unit_price(price) {
            // Price is not assigned on line creation and empty on line deletion
            if (this.price && price !== "") {
                if (this.product.is_pos_price_fix && this.price !== price) {
                    Gui.showPopup("ErrorPopup", {
                        title: _t("Restricted access to product price."),
                        body: _t(
                            "The following product price can't be changed from the PoS: %(name)s"
                        ).replace("%(name)s", this.product.display_name),
                    });
                    return;
                }
            }
            return super.set_unit_price(price);
        }
    };

Model.extend(Orderline, PosProductFixedPriceOrderline);

const PosProductFixedPriceOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        select_orderline(line) {
            super.select_orderline(line);
            // Ensures the mode is quantity, so that when deleting the orderline
            // the quantity is being set to 0 and not the price
            if (line && line.product.is_pos_price_fix) {
                this.pos.numpadMode = "quantity";
            }
        }
    };

Model.extend(Order, PosProductFixedPriceOrder);
