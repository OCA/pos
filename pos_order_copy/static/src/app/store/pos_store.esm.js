/** @odoo-module */
/*
    Copyright 2024 Dixmit
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {uuidv4} from "@point_of_sale/utils";

patch(PosStore.prototype, {
    async copy_on_new_order(currentOrder) {
        if (!currentOrder) {
            return;
        }
        if (this.isOpenOrderShareable()) {
            this.sendDraftToServer();
        }
        var json = currentOrder.export_as_JSON();
        if (this.selectedOrder) {
            this.selectedOrder.firstDraft = false;
            this.selectedOrder.updateSavedQuantity();
        }
        var newJson = {
            lines: [],
            statement_ids: [],
        };
        for (var field of Object.values(this.pos_order_copy_fields)) {
            if (field !== "lines" && json[field] !== undefined) {
                newJson[field] = json[field];
            }
        }
        const newOrder = this.createReactiveOrder(newJson);
        // We need to enforce some fields to be the standard ones
        newOrder.date_order = luxon.DateTime.now();
        newOrder.sequence_number = this.pos_session.sequence_number++;
        newOrder.access_token = uuidv4();
        newOrder.ticketCode = newOrder._generateTicketCode();
        newOrder.uid = newOrder.generate_unique_id();
        newOrder.name = _t("Order %s", newOrder.uid);
        this.orders.add(newOrder);
        this.selectedOrder = newOrder;
        return newOrder;
    },
    async _processData(loadedData) {
        await super._processData(...arguments);
        this.pos_order_copy_fields = loadedData.pos_order_copy_fields;
        this.pos_order_line_copy_fields = loadedData.pos_order_line_copy_fields;
    },
});
