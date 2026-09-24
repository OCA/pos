/** @odoo-module **/

/* Copyright CoopITEasy - Simon Hick <sim@coopiteasy.be>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl) */

import PartnerListScreen from "point_of_sale.PartnerListScreen";
import Registries from "point_of_sale.Registries";

const PosCustomerRequiredPartnerListScreen = (OriginalPartnerListScreen) =>
    class extends OriginalPartnerListScreen {
        confirm() {
            // Stay on the PartnerListScreen when unselecting the customer
            if (
                this.env.pos.config.require_customer === "order" &&
                !this.state.selectedPartner
            ) {
                this.render(true);
            } else {
                super.confirm();
            }
        }
    };

Registries.Component.extend(PartnerListScreen, PosCustomerRequiredPartnerListScreen);
