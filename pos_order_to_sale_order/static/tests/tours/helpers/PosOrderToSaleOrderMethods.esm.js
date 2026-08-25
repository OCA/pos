/** @odoo-module **/
/*
    Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";

export function clickCreateOrderButton() {
    return [
        ...ProductScreen.clickControlButtonMore(),
        {
            content: "Click on 'Create Order' Button",
            trigger: ".o_create_order_button",
            run: "click",
        },
    ];
}

export function clickCreateInvoicedOrderButton() {
    return [
        {
            content: "Click on 'Create invoiced order' Button",
            trigger: ".button-invoiced-sale-order",
            run: "click",
        },
    ];
}
