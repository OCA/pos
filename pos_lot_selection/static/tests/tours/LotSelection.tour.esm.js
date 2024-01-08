/** @odoo-module */
/*
    Copyright 2023 Trobz Consulting
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import * as Chrome from "@point_of_sale/../tests/tours/helpers/ChromeTourMethods";
import * as ReceiptScreen from "@point_of_sale/../tests/tours/helpers/ReceiptScreenTourMethods";
import * as PaymentScreen from "@point_of_sale/../tests/tours/helpers/PaymentScreenTourMethods";
import * as ProductScreen from "@point_of_sale/../tests/tours/helpers/ProductScreenTourMethods";
import {registry} from "@web/core/registry";

export function selectLotNumber(number) {
    return [
        {
            content: `check lot '${number}'`,
            trigger: ".list-line-input:first()",
            run: () => {
                const lot = $(`datalist option:contains("${number}")`);
                if (lot.length === 0) {
                    throw new Error(`Lot ${number} not found`);
                }
            },
        },
        {
            content: "set lot input",
            trigger: ".list-line-input:first()",
            run: "text " + number,
        },
        {
            content: "click validate lot number",
            trigger: ".popup .button.confirm",
        },
    ];
}

registry.category("web_tour.tours").add("LotSelectionTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.confirmOpeningPopup(),
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            selectLotNumber("10120000515"),
            ProductScreen.selectedOrderlineHas("Lot Product 1"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});

registry.category("web_tour.tours").add("ClickLotIconTour", {
    test: true,
    url: "/pos/ui",
    steps: () =>
        [
            ProductScreen.clickHomeCategory(),
            ProductScreen.clickDisplayedProduct("Lot Product 1"),
            ProductScreen.enterLotNumber("10120000515"),
            ProductScreen.clickLotIcon(),
            selectLotNumber("10120000516"),
            ProductScreen.clickPayButton(),
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            ReceiptScreen.trackingMethodIsLot(),
            Chrome.endTour(),
        ].flat(),
});
