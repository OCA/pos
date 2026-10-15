/** @odoo-module **/

/* Copyright NuoBiT - Eric Antones <eantones@nuobit.com>
   Copyright NuoBiT - Kilian Niubo <kniubo@nuobit.com>
   Copyright CoopITEasy - Simon Hick <sim@coopiteasy.be>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

const PosRequiredCustomerProductScreen = (OriginalProductScreen) =>
    class extends OriginalProductScreen {
        setup() {
            super.setup(...arguments);
        }

        async onMounted() {
            await super.onMounted(...arguments);
            if (
                this.env.pos.config.require_customer === "order" &&
                !this.env.pos.get_order().get_partner()
            ) {
                await this.onClickPartner();
            }
        }
    };

Registries.Component.extend(ProductScreen, PosRequiredCustomerProductScreen);
