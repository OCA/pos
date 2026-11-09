/** @odoo-module **/
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {ReceiptScreen} from "@point_of_sale/app/screens/receipt_screen/receipt_screen";

patch(ReceiptScreen.prototype, {
    setup() {
        super.setup();
        this.state.skipPartnerEmailUpdate = false;
    },

    get partnerEmail() {
        return this.currentOrder.getPartner()?.email;
    },

    /**
     * Show the opt-out checkbox only when sending to an address different
     * from the one stored on the customer.
     */
    get showPartnerEmailUpdateOption() {
        const email = (this.state.email || "").trim();
        return Boolean(
            this.partnerEmail &&
                email &&
                this.partnerEmail.trim().toLowerCase() !== email.toLowerCase()
        );
    },

    actionSendReceiptOnEmail() {
        this.sendReceipt.call({
            action: "action_send_receipt",
            destination: this.state.email,
            name: "Email",
            updatePartnerEmail: !this.state.skipPartnerEmailUpdate,
        });
    },

    async _sendReceiptToCustomer({action, destination, updatePartnerEmail}) {
        const order = this.currentOrder;
        if (!order.isSynced) {
            this.dialog.add(ConfirmationDialog, {
                title: _t("Unsynced order"),
                body: _t(
                    "This order is not yet synced to server. Make sure it is synced then try again."
                ),
                showReloadButton: true,
            });
            return Promise.reject();
        }
        const fullTicketImage = await this.generateTicketImage();
        const basicTicketImage = this.pos.config.basic_receipt
            ? await this.generateTicketImage(true)
            : null;
        // Update_partner_email is only supported by the email action
        const kwargs =
            action === "action_send_receipt"
                ? {update_partner_email: updatePartnerEmail !== false}
                : {};
        await this.pos.data.call(
            "pos.order",
            action,
            [[order.id], destination, fullTicketImage, basicTicketImage],
            kwargs
        );
        if (kwargs.update_partner_email) {
            // Reflect the stored email locally so the next order prefills it
            const partner = order.getPartner();
            if (partner) {
                partner.email = destination;
                partner.invoice_emails = destination;
            }
        }
    },
});
