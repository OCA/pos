/** @odoo-module **/

/* Copyright 2025 (APSL-Nagarro) - Antoni Marroig
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {RMAButton} from "@pos_rma/app/screens/product_screen/control_buttons/rma_button/rma_button.esm";
import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";

patch(TicketScreen, {
    components: {...TicketScreen.components, RMAButton},
});
