/* Copyright 2026 INVITU (https://www.invitu.com)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html). */

import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductConfigurator from "@point_of_sale/../tests/tours/utils/product_configurator_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("PosOrderLineChangeVariantTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            // Add the Red variant to the order.
            ProductScreen.clickDisplayedProduct("Change Variant Shirt"),
            ProductConfigurator.pickRadio("Red"),
            Dialog.confirm(),
            ProductScreen.selectedOrderlineHas(
                "Change Variant Shirt (Red)",
                "1.0",
                "20.0"
            ),

            // The line is already selected right after being added, so a
            // single click on it reopens the configurator.
            {
                trigger:
                    '.order-container .orderline.selected:has(.product-name:contains("Change Variant Shirt (Red)"))',
                run: "click",
            },
            ProductConfigurator.pickRadio("Blue"),
            Dialog.confirm(),

            // The line was updated in place: still a single line, now on Blue.
            ProductScreen.selectedOrderlineHas(
                "Change Variant Shirt (Blue)",
                "1.0",
                "20.0"
            ),
            {
                trigger: ".order-container .orderline",
                run: function () {
                    const lines = document.querySelectorAll(
                        ".order-container .orderline"
                    );
                    if (lines.length !== 1) {
                        throw new Error(
                            `Expected a single order line, got ${lines.length}`
                        );
                    }
                },
            },

            Chrome.endTour(),
        ].flat(),
});
