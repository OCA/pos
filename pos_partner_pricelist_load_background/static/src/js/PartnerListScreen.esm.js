/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import PartnerListScreen from "point_of_sale.PartnerListScreen";
import Registries from "point_of_sale.Registries";

const PosPartnerPricelistLoadBackgroundPartnerListScreen = (PartnerListScreen) =>
    class extends PartnerListScreen {
        async clickPartner(partner) {
            if (partner && partner.property_product_pricelist) {
                await this.env.pos._loadPartnerPricelistBackground(
                    Number(partner.property_product_pricelist[0])
                );
            }
            await super.clickPartner(partner);
        }
    };

Registries.Component.extend(
    PartnerListScreen,
    PosPartnerPricelistLoadBackgroundPartnerListScreen
);
