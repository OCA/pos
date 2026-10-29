/** @odoo-module */

import * as PartnerListScreen from "@point_of_sale/../tests/tours/helpers/PartnerListScreenTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosMultiCurrencyDepositTour", {
    test: true,
    steps: () => [
        ...ProductScreen.confirmOpeningPopup(),
        ...ProductScreen.clickPartnerButton(),
        ...PartnerListScreen.clickPartnerDetailsButton("Foreign deposit customer"),
        {trigger: ".partnerlist-screen .settle-due:contains('Deposit money')"},
        {trigger: ".selection-item:contains('Cash')"},
        {trigger: ".js_foreign_currency:not(:disabled)"},
        {trigger: ".js_foreign_amount", run: "text 100"},
        {trigger: ".foreign-currency-popup .confirm:not(:disabled)"},
        ...PaymentScreen.clickValidate(),
        {
            content: "Confirm the foreign deposit on the empty order",
            trigger: ".popup-confirm .button.confirm:contains('Yes')",
        },
        {
            trigger: ".receipt-screen .pos-receipt-foreign:contains('100')",
            isCheck: true,
        },
    ],
});
