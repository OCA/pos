/** @odoo-module **/

import PartnerListScreen from "point_of_sale.PartnerListScreen";
import Registries from "point_of_sale.Registries";
import {sprintf} from "web.utils";

export const PartnerListScreenWarning = (PartnerListScreen) =>
    class extends PartnerListScreen {
        clickPartner(partner) {
            if (
                this.state.selectedPartner &&
                this.state.selectedPartner.id === partner.id
            ) {
                return super.clickPartner(partner);
            }
            if (partner && partner.sale_warn && partner.sale_warn !== "no-message") {
                this.showPopup("ErrorPopup", {
                    title: sprintf(this.env._t("Warning for %s"), partner.name),
                    body: partner.sale_warn_msg,
                });
                if (partner.sale_warn === "block") {
                    return;
                }
            }
            return super.clickPartner(partner);
        }
    };

Registries.Component.extend(PartnerListScreen, PartnerListScreenWarning);
