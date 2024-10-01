/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {PosGlobalState} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosPartnerPricelistLoadBackgroundSPosGlobalState = (PosGlobalState) =>
    class PosPartnerPricelistLoadBackgroundPosGlobalState extends PosGlobalState {
        _getLoadedPricelistById(pricelistId) {
            return this.env.pos.pricelists.find(
                (pricelist) => pricelist.id === pricelistId
            );
        }
        _assignPricelistApplicableItems(pricelist) {
            for (const pricelistItem of pricelist.items) {
                if (pricelistItem.product_id) {
                    const product_id = pricelistItem.product_id[0];
                    const correspondingProduct = this.db.get_product_by_id(product_id);
                    if (!correspondingProduct) continue;
                    this._assignApplicableItems(
                        pricelist,
                        correspondingProduct,
                        pricelistItem
                    );
                }
                if (pricelistItem.product_tmpl_id) {
                    for (const product of Object.values(this.db.product_by_id).filter(
                        (x) => x.product_tmpl_id === pricelistItem.product_tmpl_id[0]
                    )) {
                        this._assignApplicableItems(pricelist, product, pricelistItem);
                    }
                }
            }
        }

        async _loadPartnerPricelistBackground(pricelistId) {
            const loadedPricelist = this._getLoadedPricelistById(pricelistId);
            if (loadedPricelist) {
                this.env.pos.default_pricelist = loadedPricelist;
                return;
            }
            // Block the UI while loading the pricelist
            this.env.services.ui.block();
            try {
                const productIds = Object.keys(this.db.product_by_id);
                const loadedPricelists = await this.env.services.rpc({
                    model: "pos.session",
                    method: "get_pos_ui_partner_pricelist_background",
                    args: [
                        this.pos_session_id,
                        pricelistId,
                        productIds.map((id) => Number(id)),
                    ],
                });
                for (const pricelist of loadedPricelists) {
                    this.pricelists.push(pricelist);
                    this._assignPricelistApplicableItems(pricelist);
                }
            } finally {
                this.env.services.ui.unblock();
            }
            // Now that the partner pricelist is loaded assign it as the defaut one
            this.env.pos.selectedOrder.set_pricelist(
                this._getLoadedPricelistById(pricelistId)
            );
        }

        // @override
        add_new_order() {
            const order = super.add_new_order();
            order.set_pricelist(
                this.env.pos._getLoadedPricelistById(
                    this.env.pos.config.pricelist_id[0]
                )
            );
            return order;
        }
    };

Registries.Model.extend(
    PosGlobalState,
    PosPartnerPricelistLoadBackgroundSPosGlobalState
);
