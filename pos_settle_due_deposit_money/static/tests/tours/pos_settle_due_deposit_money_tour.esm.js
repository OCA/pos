/* eslint-disable */
import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/generic_helpers/dialog_util";
import * as PartnerList from "@point_of_sale/../tests/pos/tours/utils/partner_list_util";
import * as ProductScreen from "@point_of_sale/../tests/pos/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("pos_settle_due_deposit_money_tour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickPartnerButton(),
            PartnerList.clickPartnerOptions("C Partner"),
            // The partner has a due invoice, so the settle option is there
            PartnerList.checkDropDownItemText("Settle invoices"),
            // Without this module the deposit option would be hidden
            PartnerList.checkDropDownItemText("Deposit money"),
            PartnerList.clickDropDownItemText("Deposit money"),
            Dialog.is("Select the payment method to deposit money"),
            Dialog.cancel(),
            Chrome.endTour(),
        ].flat(),
});
