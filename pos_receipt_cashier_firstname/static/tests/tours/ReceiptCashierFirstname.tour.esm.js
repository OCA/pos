/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as PaymentScreen from "@point_of_sale/../tests/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {negate} from "@point_of_sale/../tests/tours/utils/common";
import {registry} from "@web/core/registry";

export function payAndCheckCashier(firstname, lastname) {
    return [
        ProductScreen.addOrderline("Desk Pad", "1"),
        {
            content: "Kitchen ticket shows only the cashier's first name",
            trigger: "body",
            run: async () => {
                const pos = window.posmodel;
                const order = pos.get_order();
                const changes = Object.values(pos.getOrderChanges().orderlines);
                const printed = await pos.getRenderedReceipt(order, "New", changes);
                const header = printed.querySelector(".o-employee-name").textContent;
                const expected = firstname ? `By: ${firstname}` : "";
                if (
                    header.includes(lastname) ||
                    (firstname && !header.includes(expected)) ||
                    (!firstname && header.includes("By:"))
                ) {
                    throw new Error(`Unexpected kitchen ticket header: ${header}`);
                }
            },
        },
        ProductScreen.clickPayButton(),
        PaymentScreen.clickPaymentMethod("Bank"),
        PaymentScreen.clickValidate(),
        {
            content: "Receipt cashier line shows only the first name",
            trigger: firstname
                ? `.pos-receipt-contact .cashier:contains(Served by ${firstname})`
                : negate(".pos-receipt-contact .cashier"),
        },
        {
            content: `Receipt does not show the last name ${lastname}`,
            trigger: negate(`.pos-receipt:contains(${lastname})`),
        },
    ].flat();
}

registry.category("web_tour.tours").add("ReceiptCashierFirstname", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            payAndCheckCashier("Jean", "Dupont"),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("ReceiptNoCashierFirstname", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            payAndCheckCashier("", "Dupont"),
            Chrome.endTour(),
        ].flat(),
});
