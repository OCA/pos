/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {AttachmentsButton} from "../../utils/attachment_button/attachment_button.esm";
import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";
patch(TicketScreen, {
    components: {
        ...TicketScreen.components,
        AttachmentsButton,
    },
});
