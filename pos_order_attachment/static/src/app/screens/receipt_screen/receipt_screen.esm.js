/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {AttachmentPopup} from "../../utils/attachment_popup/attachment_popup.esm";
import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(ReceiptScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.popup = useService("popup");
    },
    showAttachments() {
        this.popup.add(AttachmentPopup, {order: this.currentOrder});
    },
});
