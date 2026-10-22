/** @odoo-module **/

import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {SaleOrderRow} from "@pos_sale/app/order_management_screen/sale_order_row/sale_order_row";
import {SelectionPopup} from "@point_of_sale/app/utils/input_popups/selection_popup";
import {_t} from "@web/core/l10n/translation";
import {onWillStart} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

patch(SaleOrderRow.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
        this.popup = useService("popup");
        this.orm = useService("orm");
        this.actionService = useService("action");
        this.report_type = "qweb-pdf";
        this.title = _t("What do you want to print?");
        onWillStart(async () => {
            this.report_ids = this.pos.config.print_sales_order_ids;
            this.printActions = await this.loadPrintActions();
        });
    },
    get showPrint() {
        return this.report_ids.length > 0;
    },
    searchDomain() {
        var domain = [];
        if (this.report_ids.length > 0) {
            domain = [["id", "in", this.report_ids]];
        }
        return domain;
    },
    async loadPrintActions() {
        const values = await this.orm.searchRead(
            "ir.actions.report",
            this.searchDomain(),
            ["id", "name", "report_name"]
        );
        return values;
    },
    getPrintAction(action_id) {
        return this.printActions.find((action) => action.id === action_id);
    },
    async getListPopup() {
        var values = [];
        if (this.printActions.length > 0) {
            for (const action of this.printActions) {
                values.push({
                    id: action.id,
                    label: action.name,
                    item: action.id,
                    model: action.model,
                    report_name: action.id,
                });
            }
        }
        return values;
    },
    async showPopupPrint(order) {
        const {confirmed, payload: selectedItem} = await this.popup.add(
            SelectionPopup,
            {
                title: this.title,
                list: await this.getListPopup(),
            }
        );

        if (confirmed) {
            try {
                const actionPrint = this.getPrintAction(selectedItem);
                this.actionService.doAction({
                    type: "ir.actions.report",
                    report_type: this.report_type,
                    report_name: `${actionPrint.report_name}?docids=${[order.id]}`,
                    report_file: actionPrint.report_name,
                });
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                } else {
                    this.popup.add(ErrorPopup, {
                        title: _t("Network Error"),
                        body: _t("Unable to download the report."),
                    });
                }
            }
        }
    },
    async _printSaleOrder(ev, order) {
        ev.stopPropagation();
        ev.preventDefault();
        await this.showPopupPrint(order);
    },
});
