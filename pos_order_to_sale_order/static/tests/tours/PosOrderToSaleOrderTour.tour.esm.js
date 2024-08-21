/** @odoo-module **/
/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as PosOrderToSaleOrderScreen from "./helpers/PosOrderToSaleOrderMethods.esm";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosOrderToSaleOrderTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.clickHomeCategory(),
            ProductScreen.addOrderline("Whiteboard Pen", "1"),
            ProductScreen.addOrderline("Wall Shelf Unit", "1"),
            ProductScreen.addCustomerNote("Product Note"),
            ProductScreen.clickPartnerButton(),
            ProductScreen.clickCustomer("Addison Olson"),
            PosOrderToSaleOrderScreen.clickCreateOrderButton(),
            PosOrderToSaleOrderScreen.clickCreateInvoicedOrderButton(),
            ProductScreen.isShown(),
            Chrome.endTour(),
        ].flat(),
});
