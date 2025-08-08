/** @odoo-module **/
/*
    Copyright 2025 Antoni Marroig APSL-Nagarro (amarroig@apsl.net).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import * as RMAScreen from "./helpers/CreateRmaFromPosMethods.esm";
import * as TicketScreen from "@point_of_sale/../tests/tours/helpers/TicketScreenTourMethods";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("CreateRmaFromPosTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.addOrderline("Desk Pad", "1", "3"),
            ProductScreen.clickPartnerButton(),
            ProductScreen.clickCustomer("Partner Test 2"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Bank"),
            PaymentScreen.clickValidate(),
            Chrome.clickMenuButton(),
            Chrome.clickTicketButton(),
            TicketScreen.selectFilter("Paid"),
            TicketScreen.selectOrder("-0001"),
            TicketScreen.clickControlButton("Create RMA"),
            RMAScreen.checkErrorsPopUp(),
            RMAScreen.fillRmaPopup(),
            TicketScreen.clickControlButton("Create RMA"),
            {
                content: "Wait for error message validation",
                trigger:
                    ".popup-error .modal-body:contains('Cannot create RMA for this product')",
                is_visible: true,
            },
            Chrome.endTour(),
        ].flat(),
});
