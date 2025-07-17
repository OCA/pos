/** @odoo-module **/
/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as PosOrderToSaleOrderScreen from "./helpers/PosOrderToSaleOrderMethods.esm";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosOrderToSaleOrderTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.addOrderline("Whiteboard Pen", "1"),
            ProductScreen.addOrderline("Wall Shelf Unit", "1"),
            ProductScreen.addCustomerNote("Product Note"),
            ProductScreen.clickPartnerButton(),
            ProductScreen.clickCustomer("Addison Olson"),
            PosOrderToSaleOrderScreen.clickCreateOrderButton(),
            PosOrderToSaleOrderScreen.clickCreateInvoicedOrderButton(),
            ProductScreen.closePos(),
        ].flat(),
});
