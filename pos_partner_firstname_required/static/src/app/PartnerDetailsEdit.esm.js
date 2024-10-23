/** @odoo-module **/

/* Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PartnerDetailsEdit.prototype, {
    checkPartnerPersonName() {
        /* We add this hook in order to check second last name later */
        return !this.changes.firstname | !this.changes.lastname;
    },
    saveChanges() {
        if (this.changes.is_company) {
            this.changes.lastname = this.changes.firstname = undefined;
        } else {
            if (this.checkPartnerPersonName()) {
                return this.popup.add(ErrorPopup, {
                    title: _t("Missing information"),
                    body: _t("Customer firstname and lastname is required"),
                });
            }
            this.changes.name = this._updatePartnerName(
                this.changes.firstname,
                this._getLastName(this.changes)
            );
        }
        super.saveChanges();
    },
});
