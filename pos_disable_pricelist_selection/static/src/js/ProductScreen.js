/** @odoo-module **/

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    get controlButtons() {
        const buttons = super.controlButtons;
        const pricelistButton = buttons.find(
            (button) => button.component.name === "SetPricelistButton"
        );

        if (pricelistButton) {
            if (
                this.pos.config.hide_pricelist_button ||
                !this.pos.config.use_pricelist
            ) {
                return buttons.filter(
                    (button) => button.component.name !== "SetPricelistButton"
                );
            }

            pricelistButton.condition = function () {
                const {config, selectable_pricelists} = this.pos;
                return (
                    config.use_pricelist &&
                    selectable_pricelists &&
                    selectable_pricelists.length > 1
                );
            };
        }
        return buttons;
    },
});
