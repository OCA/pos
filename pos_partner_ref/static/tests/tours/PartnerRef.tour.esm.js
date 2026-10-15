import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import * as PartnerList from "@point_of_sale/app/screens/partner_list/partner_list";
import * as ProductScreenPartnerList from "@point_of_sale/../tests/tours/utils/product_screen_partner_list_util";
import * as Utils from "@point_of_sale/../tests/tours/utils/common";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PartnerRef", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),
            ProductScreen.clickPartnerButton(),
            // PartnerList.checkContactValues(
            //     "John Doe",
            //     "1 street of astreet",
            //     "9898989899",
            //     "0987654321",
            //     "john@doe.com"
            // ),
            // selectButton("Discard"),
            PartnerList.checkContactValues(
                "John Doe",
                "1 street of astreet",
                "9898989899",
                "0987654321",
                "john@doe.com"
            ),
            Utils.selectButton("Discard"),
            // {
            //     isActive: ["ref"],
            //     ...back(),
            // },

            // Check searches
            ProductScreenPartnerList.searchCustomerValueAndClear("REF987654321"),
            ProductScreen.clickPartnerButton(),
            {
                isActive: ["ref"],
                content: `Click search field`,
                trigger: `.fa-search.undefined`,
                run: `click`,
            },
            {
                content: `Search customer with "REF987654321"`,
                trigger: `.modal-dialog .input-group input`,
                run: `edit j%hn d%e`,
            },
            {
                content: `Check "Demo Partner Ref" is shown`,
                trigger: `.partner-list .partner-info:nth-child(1):contains("Demo Partner Ref")`,
            },
        ].flat(),
});
