/* eslint-disable */
import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/generic_helpers/dialog_util";
import * as PaymentScreen from "@point_of_sale/../tests/pos/tours/utils/payment_screen_util";
import * as ProductScreen from "@point_of_sale/../tests/pos/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("pos_ship_later_default_tour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.addOrderline("Whiteboard Pen", "1"),
            ProductScreen.clickPartnerButton(),
            ProductScreen.clickCustomer("Partner Test with Address"),
            ProductScreen.clickPayButton(),
            {
                content: "verify ship later button is hidden",
                trigger: ".payment-buttons:not(:has(.button:contains('Ship Later')))",
                run: () => {},
            },
            PaymentScreen.clickPaymentMethod("Cash"),
            PaymentScreen.clickValidate(),
            {
                content: "close point of sale",
                trigger: ".pos-receipt",
                run: () => {},
            },
        ].flat(),
});
