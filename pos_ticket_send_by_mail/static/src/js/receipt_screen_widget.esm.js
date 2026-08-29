/*

# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

*/

import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import {patch} from "@web/core/utils/patch";

patch(ReceiptScreen.prototype, {
    get showSendReceiptOption() {
        const receipt_options = this.pos.config
            ? this.pos.config.receipt_options
            : false;
        const client = this.currentOrder.partner_id;
        const email_pos_receipt = client ? client.pos_email_receipt : false;
        if (
            receipt_options &&
            receipt_options === "3" &&
            email_pos_receipt == "email_pos_receipt"
        ) {
            return false;
        }
        return true;
    },
});
