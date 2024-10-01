/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import Registries from "point_of_sale.Registries";
import SetPricelistButton from "point_of_sale.SetPricelistButton";

const SetPricelistButtonPosTechnicalPricelist = (OriginalSetPricelistButton) =>
    class extends OriginalSetPricelistButton {
        async showPopup(name, props) {
            const availablePricelists = Object.values(
                this.env.pos.config.available_pricelist_ids
            );
            const partner = this.env.pos.selectedOrder.partner;
            const partnerPricelistID =
                partner &&
                partner.property_product_pricelist &&
                partner.property_product_pricelist[0];
            props.list = props.list.filter(
                (x) => availablePricelists.includes(x.id) || x.id === partnerPricelistID
            );
            return await super.showPopup(name, props);
        }
    };

Registries.Component.extend(
    SetPricelistButton,
    SetPricelistButtonPosTechnicalPricelist
);
