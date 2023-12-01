/** @odoo-module */

/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
import {EditListPopup} from "@point_of_sale/app/store/select_lot_popup/select_lot_popup";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

patch(EditListPopup.prototype, {
    setup() {
        super.setup(...arguments);
        if (this.props.title === _t("Lot/Serial Number(s) Required")) {
            this.props.lots = session.lots;
        }
    },
});
