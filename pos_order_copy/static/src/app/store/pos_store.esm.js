/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {uuidv4} from "@point_of_sale/utils";
import {serializeDateTime} from "@web/core/l10n/dates";

patch(PosStore.prototype, {
    async copy_on_new_order(currentOrder) {
        if (!currentOrder) {
            return;
        }
        if (this.isOpenOrderShareable()) {
            this.sendDraftToServer();
        }
        var json = currentOrder;
        if (this.selectedOrder) {
            this.selectedOrder.firstDraft = false;
            this.selectedOrder.updateSavedQuantity();
        }
        var newJson = {
            lines: [],
            statement_ids: [],
        };
        for (var field of Object.values(this.session._pos_order_copy_fields)) {
            if (field !== "lines" && json[field] !== undefined) {
                newJson[field] = json[field];
            }
        }
        const newOrder = this.createNewOrder(newJson);
        // We need to enforce some fields to be the standard ones
        newOrder.date_order = serializeDateTime(luxon.DateTime.now());
        var step = this.currentSequenceNumber;
        newOrder.sequence_number = step++;
        newOrder.access_token = uuidv4();
        newOrder.ticketCode = newOrder._generateTicketCode();
        newOrder.uid = newOrder.generate_unique_id();
        newOrder.name = _t("Order %s", newOrder.uid);
        this.selectedOrderUuid = newOrder.uuid;
        return newOrder;
    },
});
