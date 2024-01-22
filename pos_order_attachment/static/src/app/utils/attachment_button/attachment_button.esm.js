/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {AttachmentPopup} from "../attachment_popup/attachment_popup.esm";
import {Component} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";

export class AttachmentsButton extends Component {
    setup() {
        this.popup = useService("popup");
    }

    get message_attachment_count() {
        return this.props.order ? this.props.order.message_attachment_count : 0;
    }

    async click() {
        await this.popup.add(AttachmentPopup, {order: this.props.order});
    }
}
AttachmentsButton.template = "pos_order_attachment.AttachmentsButton";

/*
ReceiptScreen.addControlButton({
    component: AttachmentsButton,
});*/
