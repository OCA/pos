/* Copyright NuoBiT - Eric Antones <eantones@nuobit.com>
   Copyright NuoBiT - Kilian Niubo <kniubo@nuobit.com>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {onWillPatch} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    setup() {
        super.setup();
        onWillPatch(() => {
            if (
                this.pos.config.require_customer === "order" &&
                !this.currentOrder.get_partner()
            ) {
                this.pos.selectPartner();
            }
        });
    },
});
