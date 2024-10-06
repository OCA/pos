/** @odoo-module **/

/* Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {PartnerDetailsEdit} from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup(...arguments);
        this.popup = useService("popup");
        this.changes.street = this.props.partner.street;
        this.changes.city = this.props.partner.city;
        this.changes.zip = this.props.partner.zip;
    },
    saveChanges() {
        if (!this.changes.street) {
            return this.popup.add(ErrorPopup, {
                title: _t("Missing information"),
                body: _t("Street is required"),
            });
        } else if (!this.changes.city) {
            return this.popup.add(ErrorPopup, {
                title: _t("Missing information"),
                body: _t("City is required"),
            });
        } else if (!this.changes.zip) {
            return this.popup.add(ErrorPopup, {
                title: _t("Missing information"),
                body: _t("Zip is required"),
            });
        }
        super.saveChanges();
    },
});
