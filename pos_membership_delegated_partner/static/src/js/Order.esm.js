/** @odoo-module **/

import {Order} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const DelegatedPartnerOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        set_orderline_options(orderline, options) {
            super.set_orderline_options(...arguments);
            if (options.delegated_member) {
                orderline.delegated_member = options.delegated_member;
            }
        }
    };

Registries.Model.extend(Order, DelegatedPartnerOrder);
