import {AutomaticCashdrawerInventoryDialog} from "@pos_automatic_cashdrawer_cashlogy/dialogs/cashdrawer_inventory.esm";
import {Component} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {renderToElement} from "@web/core/utils/render";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class AutomaticCashdrawerAdmin extends Component {
    static template = "AutomaticCashdrawerAdmin";
    static components = {Dialog};
    static props = {
        close: Function,
    };
    setup() {
        super.setup(...arguments);
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.pos = usePos();
        this.printer = useService("printer");
        this.ui = useService("ui");
    }

    /**
     * HELPERS
     **/

    extras(amount, type) {
        const formattedAmount = this.pos.formatCurrencyCashlogy(amount);
        const translatedType = _t(type);
        return {
            formattedAmount,
            translatedType,
        };
    }

    /**
     * ACTIONS
     **/

    cancel() {
        this.props.close();
    }

    async action_print_inventory() {
        this.dialog.closeAll();
        try {
            this.ui.block();
            const totals = await this.pos.callAutomaticCashdrawerGetTotalAmount();
            const inventory = await this.pos.callAutomaticCashdrawerGetInventory();
            const sorted_values = Object.keys(inventory.total)
                .map((k) => parseFloat(k))
                .sort((a, b) => b - a);
            return this.dialog.add(AutomaticCashdrawerInventoryDialog, {
                totals: totals,
                inventory: inventory,
                sorted_values: sorted_values,
            });
        } catch (error) {
            this.pos.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    }

    async action_display_backoffice() {
        try {
            await this.pos.callAutomaticCashlogyDisplayBackoffice();
        } catch (error) {
            this.pos.showErrorCashlogy(error);
        } finally {
            this.notification.add(_t("Backoffice displayed successfully"), {
                type: "success",
            });
        }
    }

    async action_cancel() {
        this.ui.block();
        await this.pos.callAutomaticCashdrawerStopAcceptance().then(async (res) => {
            const xmlReportElement = renderToElement(
                "AutomaticCashdrawerActionXmlReport",
                {
                    pos: this.pos,
                    report: {
                        name: _t("Manual Cancel"),
                        lines: [
                            _t("Money in/out: ") + this.pos.formatCurrencyCashlogy(res),
                            _t(
                                "IMPORTANT: This operations is not registered on the cash statement. You have to manually register it."
                            ),
                        ],
                    },
                }
            );
            await this.pos.sendCashlogy("print_xml_receipt", {
                receipt: xmlReportElement.outerHTML,
            });
            this.notification.add(_t("Send Cancel Successfully"), {type: "success"});
        });
        this.ui.unblock();
        this.dialog.closeAll();
    }

    async action_close_till() {
        this.ui.block();
        this.pos.checkCashInOutPossible();
        await this.pos.callAutomaticCashdrawerDisplayCloseTill().then(async (res) => {
            if (res.added) {
                await this.pos
                    .actionPutMoneyIn(
                        res.added,
                        _t("Automatic Cashdrawer: Close Till / ADDED"),
                        this.extras(res.added, "in")
                    )
                    .then(async (st_line) => {
                        const xmlReportElement = renderToElement(
                            "AutomaticCashdrawerActionXmlReport",
                            {
                                pos: this.pos,
                                report: {
                                    name: _t("Close Till Result"),
                                    lines: [
                                        _t("Total added: ") +
                                            this.pos.formatCurrencyCashlogy(res.added),
                                    ],
                                    st_line: st_line,
                                },
                            }
                        );
                        await this.pos.sendCashlogy("print_xml_receipt", {
                            receipt: xmlReportElement.outerHTML,
                        });
                        this.notification.add(_t("Close Till / ADDED Successfully"), {
                            type: "success",
                        });
                    });
            }
            if (res.dispensed) {
                await this.pos
                    .actionTakeMoneyOut(
                        res.dispensed,
                        _t("Automatic Cashdrawer: Close Till / DISPENSED"),
                        this.extras(res.dispensed, "out")
                    )
                    .then(async (st_line) => {
                        const xmlReportElement = renderToElement(
                            "AutomaticCashdrawerActionXmlReport",
                            {
                                pos: this.pos,
                                report: {
                                    name: _t("Close Till Result"),
                                    lines: [
                                        _t("Total dispensed: ") +
                                            this.pos.formatCurrencyCashlogy(
                                                res.dispensed
                                            ),
                                    ],
                                    st_line: st_line,
                                },
                            }
                        );
                        await this.pos.sendCashlogy("print_xml_receipt", {
                            receipt: xmlReportElement.outerHTML,
                        });
                        this.notification.add(
                            _t("Close Till / DISPENSED Successfully"),
                            {type: "success"}
                        );
                    });
            }
        });
        this.ui.unblock();
        this.dialog.closeAll();
    }

    async action_empty_stacker() {
        this.ui.block();
        this.pos.checkCashInOutPossible();
        await this.pos.callAutomaticCashdrawerEmptyStacker().then(async (res) => {
            if (res) {
                await this.pos
                    .actionTakeMoneyOut(
                        res,
                        _t("Automatic Cashdrawer: Empty Stacker"),
                        this.extras(res, "out")
                    )
                    .then(async (st_line) => {
                        const xmlReportElement = renderToElement(
                            "AutomaticCashdrawerActionXmlReport",
                            {
                                pos: this.pos,
                                report: {
                                    name: _t("Empty Stacker"),
                                    lines: [
                                        _t("Total dispensed: ") +
                                            this.pos.formatCurrencyCashlogy(res),
                                    ],
                                    st_line: st_line,
                                },
                            }
                        );
                        await this.pos.sendCashlogy("print_xml_receipt", {
                            receipt: xmlReportElement.outerHTML,
                        });
                        this.notification.add(_t("Empty Stacker Successfully"), {
                            type: "success",
                        });
                    });
            }
        });
        this.ui.unblock();
        this.dialog.closeAll();
    }

    async action_complete_emptying() {
        this.ui.block();
        this.pos.checkCashInOutPossible();
        await this.pos
            .callAutomaticCashdrawerDisplayCompleteEmptying()
            .then(async (res) => {
                if (res) {
                    await this.pos
                        .actionTakeMoneyOut(
                            res,
                            _t("Automatic Cashdrawer: Complete Emptying"),
                            this.extras(res, "out")
                        )
                        .then(async (st_line) => {
                            const xmlReportElement = renderToElement(
                                "AutomaticCashdrawerActionXmlReport",
                                {
                                    pos: this.pos,
                                    report: {
                                        name: _t("Complete Emptying"),
                                        lines: [
                                            _t("Total dispensed: ") +
                                                this.pos.formatCurrencyCashlogy(res),
                                        ],
                                        st_line: st_line,
                                    },
                                }
                            );
                            await this.pos.sendCashlogy("print_xml_receipt", {
                                receipt: xmlReportElement.outerHTML,
                            });
                            this.notification.add(
                                _t("Complete Emptying Successfully"),
                                {type: "success"}
                            );
                        });
                }
            });
        this.ui.unblock();
        this.dialog.closeAll();
    }
}
