import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PartnerList} from "@point_of_sale/app/screens/partner_list/partner_list";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";

patch(PartnerList.prototype, {
    clickPartner(partner) {
        if (this.props.partner?.id === partner?.id) {
            return super.clickPartner(...arguments);
        }

        if (partner?.sale_warn && partner.sale_warn !== "no-message") {
            this.dialog.add(AlertDialog, {
                title: sprintf(_t("Warning for %s"), partner.name),
                body: partner.sale_warn_msg,
            });

            if (partner.sale_warn === "block") {
                return;
            }
        }
        return super.clickPartner(...arguments);
    },
});
