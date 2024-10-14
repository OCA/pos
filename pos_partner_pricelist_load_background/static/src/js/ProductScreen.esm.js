/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

const PosPartnerPricelistLoadBackgroundProductScreen = (ProductScreen) =>
    class extends ProductScreen {
        async onClickPartner() {
            await super.onClickPartner();
            if (this.partner && this.partner.property_product_pricelist) {
                await this.env.pos._loadPartnerPricelistBackground(
                    Number(this.partner.property_product_pricelist[0])
                );
            } else {
                this.env.pos.selectedOrder.set_pricelist(
                    this.env.pos._getLoadedPricelistById(
                        this.env.pos.config.pricelist_id[0]
                    )
                );
            }
        }
    };

Registries.Component.extend(
    ProductScreen,
    PosPartnerPricelistLoadBackgroundProductScreen
);
