/** @odoo-module **/
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup(...arguments);
        this.popup = useService("popup");
        this.changes.vat = this.props.partner.vat;
    },
    saveChanges() {
        if (!this.changes.vat) {
            return this.popup.add(ErrorPopup, {
                title: _t("Missing information"),
                body: _t("Tax ID is required"),
            });
        }
        super.saveChanges();
    },
});
