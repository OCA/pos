/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosPartnerPricelistLoadBackgroundOrder = (Order) =>
    class PosPartnerPricelistLoadBackgroundOrder extends Order {
        /**  @override **/
        init_from_JSON(json) {
            super.init_from_JSON(json);
            if (json.pricelist_id)
                this.pos._loadPartnerPricelistBackground(json.pricelist_id);
        }
    };

Registries.Model.extend(Order, PosPartnerPricelistLoadBackgroundOrder);
