/** @odoo-module **/

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PartnerListScreen} from "@point_of_sale/app/screens/partner_list/partner_list";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";
import {useService} from "@web/core/utils/hooks";

patch(PartnerListScreen.prototype, {
    setup() {
        super.setup();
        this.popup = useService("popup");
    },
    clickPartner(partner) {
        if (
            this.state.selectedPartner &&
            this.state.selectedPartner.id === partner.id
        ) {
            return super.clickPartner(partner);
        }
        if (partner && partner.sale_warn && partner.sale_warn !== "no-message") {
            this.popup.add(ErrorPopup, {
                title: sprintf(_t("Warning for %s"), partner.name),
                body: partner.sale_warn_msg,
            });
            if (partner.sale_warn === "block") {
                return;
            }
        }
        return super.clickPartner(partner);
    },
});
