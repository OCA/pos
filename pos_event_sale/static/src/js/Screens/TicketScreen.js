/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.TicketScreen", function (require) {
    "use strict";

    const TicketScreen = require("point_of_sale.TicketScreen");
    const Registries = require("point_of_sale.Registries");

    const PosEventSaleTicketScreen = (TicketScreen) =>
        class extends TicketScreen {
            /**
             * @override
             */
            _getToRefundDetail(orderline) {
                const res = super._getToRefundDetail(...arguments);
                res.orderline.event_ticket_id = orderline.event_ticket_id;
                return res;
            }
            /**
             * @override
             */
            _prepareRefundOrderlineOptions(toRefundDetail) {
                const res = super._prepareRefundOrderlineOptions(...arguments);
                res.extras.event_ticket_id = toRefundDetail.orderline.event_ticket_id;
                return res;
            }
        };

    Registries.Component.extend(TicketScreen, PosEventSaleTicketScreen);
    return TicketScreen;
});
