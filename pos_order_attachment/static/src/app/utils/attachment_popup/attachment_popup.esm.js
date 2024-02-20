/** @odoo-module */
import {Component, onWillStart, useState, useSubEnv} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {ConfirmPopup} from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import {FileModel} from "@web/core/file_viewer/file_model";
import {FileUploader} from "@web/views/fields/file_handler";
import {Order} from "@point_of_sale/app/store/models";

import {_t} from "@web/core/l10n/translation";
import {url} from "@web/core/utils/urls";
import {useFileViewer} from "@web/core/file_viewer/file_viewer_hook";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class Attachment extends Component {
    setup() {
        super.setup(...arguments);
        this.orm = useService("orm");
        this.uploadService = useService("file_upload");
        this.ui = useState(useService("ui"));
        this.imagesWidth = 1920;
        this.popup = useService("popup");
    }
    fileView() {
        this.env.fileView(this.props.attachment);
    }
    getImageUrl() {
        if (this.props.attachment.uploading && this.props.attachment.tmpUrl) {
            return this.props.attachment.tmpUrl;
        }
        return url(this.props.attachment.urlRoute, {
            ...this.props.attachment.urlQueryParams,
            width: this.imagesWidth,
            height: this.props.imagesHeight,
        });
    }
    canDownload() {
        return !this.props.attachment.uploading;
    }
    onClickDownload() {
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", this.props.attachment.downloadUrl);
        // Adding 'download' attribute into a link prevents open a new
        // tab or change the current location of the window. This avoids
        // interrupting the activity in the page such as rtc call.
        downloadLink.setAttribute("download", "");
        downloadLink.click();
    }
    async onClickUnlink() {
        const {confirmed} = await this.popup.add(ConfirmPopup, {
            title: _t("Delete attachment?"),
            body: _t(
                "This operation will permanently delete the attachment. You will lose all the data. This operation cannot be undone."
            ),
        });
        if (confirmed) {
            await this.env.services.orm.call("ir.attachment", "unlink", [
                [this.props.attachment.id],
            ]);
            this.env.services.file_upload.bus.trigger("FILE_UPLOAD_LOADED", {});
        }
    }
}
Attachment.template = "pos_order_attachment.Attachment";
function dataUrlToBlob(data, type) {
    const binData = window.atob(data);
    const uiArr = new Uint8Array(binData.length);
    uiArr.forEach((_, index) => (uiArr[index] = binData.charCodeAt(index)));
    return new Blob([uiArr], {type});
}

export class AttachmentPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.pos = usePos();
        this.orm = useService("orm");
        this.state = useState({attachments: []});
        this.uploadService = useService("file_upload");
        this.fileViewer = useFileViewer();
        useBus(this.uploadService.bus, "FILE_UPLOAD_LOADED", () => {
            this.onWillStart();
        });
        useSubEnv({fileView: this.fileView.bind(this)});
        onWillStart(this.onWillStart);
    }
    async fileView(attachment) {
        await this.fileViewer.open(
            this.state.attachments.find((att) => {
                return att.id === attachment.id;
            }),
            this.state.attachments
        );
    }

    async onWillStart() {
        const ormAttachments = await this.orm.call("pos.order", "pos_attachments", [
            [this.props.order.server_id],
        ]);
        const attachments = [];
        for (const attachmentId in ormAttachments) {
            var attachment = new FileModel();
            attachment.filename = ormAttachments[attachmentId].filename;
            for (const field in ormAttachments[attachmentId]) {
                attachment[field] = ormAttachments[attachmentId][field];
            }
            attachments.push(attachment);
        }
        this.state.attachments = attachments;
    }
    async onFileUploaded({data, name, type}) {
        const file = new File([dataUrlToBlob(data, type)], name, {type});
        return this.uploadService.upload("/web/binary/upload_attachment", [file], {
            buildFormData: (formData) => {
                formData.append("model", "pos.order");
                formData.append("id", this.props.order.server_id);
            },
        });
    }

    async cancel() {
        this.pos._invalidateSyncedOrdersCache([this.props.order.server_id]);
        const [order] = await this.orm.call("pos.order", "export_for_ui", [
            [this.props.order.server_id],
        ]);
        this.pos.TICKET_SCREEN_STATE.syncedOrders.cache[order.id] = new Order(
            {env: this.env},
            {pos: this.pos, json: order}
        );
        return await super.cancel();
    }
}

AttachmentPopup.template = "pos_order_attachment.AttachmentPopup";
AttachmentPopup.components = {Attachment, FileUploader};
