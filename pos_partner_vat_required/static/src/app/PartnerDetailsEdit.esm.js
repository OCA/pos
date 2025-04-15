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
        Object.assign(this.props.imperativeHandle, {
            save: async () => this.saveChanges(),
        });
    },
    async saveChanges() {
        if (!this.changes.vat) {
            return this.popup.add(ErrorPopup, {
                title: _t("Missing information"),
                body: _t("Tax ID is required"),
            });
        }
        if (this.changes.country_id) {
            const result = await this.pos.orm.call("res.partner", "vat_check", [], {
                vat: this.changes.vat,
                country_id: this.changes.country_id,
            });
            if (!result) {
                return this.popup.add(ErrorPopup, {
                    title: _t("Tax ID Verification Failed"),
                    body: _t("The Tax ID is not valid"),
                });
            }
        }
        super.saveChanges();
    },
});
