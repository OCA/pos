/** @odoo-module **/

import Registries from "point_of_sale.Registries";
import TicketScreen from "point_of_sale.TicketScreen";

export const DelegatedPartnerTicketScreen = (OriginalTicketScreen) =>
    class extends OriginalTicketScreen {
        _getToRefundDetail(orderline) {
            const toRefundDetail = super._getToRefundDetail(orderline);
            toRefundDetail.orderline.delegated_member = orderline.delegated_member;
            return toRefundDetail;
        }
        _prepareRefundOrderlineOptions(toRefundDetail) {
            const options = super._prepareRefundOrderlineOptions(toRefundDetail);
            options.delegated_member = toRefundDetail.orderline.delegated_member;
            return options;
        }
    };

Registries.Component.extend(TicketScreen, DelegatedPartnerTicketScreen);
