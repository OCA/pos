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
        this.partner_names_order = this.pos.config.partner_names_order;
        this.changes.is_company = this.props.partner.is_company;
        this.changes.firstname = this.props.partner.firstname;
        this.changes.lastname = this.props.partner.lastname;
    },
    get isCompanyIcon() {
        if (this.changes.is_company) {
            return "fa-building";
        }
        return "fa-user";
    },
    toggleIsCompany() {
        this.changes.is_company = !this.changes.is_company;
    },
    checkPartnerPersonName() {
        /* We add this hook in order to check second last name later */
        return !this.changes.firstname && !this.changes.lastname;
    },
    saveChanges() {
        if (this.changes.is_company) {
            this.changes.lastname = this.changes.firstname = undefined;
        } else {
            if (this.checkPartnerPersonName()) {
                return this.popup.add(ErrorPopup, {
                    title: _t("Missing information"),
                    body: _t("Customer firstname or lastname is required"),
                });
            }
            this.changes.name = this._updatePartnerName(
                this.changes.firstname,
                this._getLastName(this.changes)
            );
        }
        super.saveChanges();
    },
    _getLastName(changes) {
        return changes.lastname;
    },
    _updatePartnerName(firstname, lastname) {
        let name = null;
        if (!lastname) {
            return firstname;
        }
        if (!firstname) {
            return lastname;
        }
        if (this.partner_names_order === "last_first_comma") {
            name = lastname + ", " + firstname;
        } else if (this.partner_names_order === "first_last") {
            name = firstname + " " + lastname;
        } else {
            name = lastname + " " + firstname;
        }
        return name.trim();
    },
});
