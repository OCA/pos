/* global clearTimeout, setTimeout */

import {Component, onMounted, onWillUnmount, useState} from "@odoo/owl";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {roundPrecision} from "@web/core/utils/numbers";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class AutomaticCashdrawerCashInDialog extends Component {
    static template = "AutomaticCashdrawerCashInDialog";
    static components = {Dialog};
    static props = {
        allow_cancel: Boolean,
        auto_accept: Boolean,
        to_collect: Number,
        payment: Boolean,
        confirmCashIn: Function,
        cancelCashIn: Function,
        close: Function,
        body: {type: String, optional: true},
    };

    setup() {
        super.setup();
        this.pos = usePos();
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.ui = useService("ui");
        this.inputBuffer = useState({value: 0.0});
        this.loading = useState({value: false});
        this.closed = false;
        const {payment} = this.props;
        onMounted(() => {
            this.loading.value = true;
            if (payment) {
                this.pos.callAutomaticCashdrawerStartAcceptance().then(() => {
                    this.updateCounter();
                });
            } else {
                this.pos.callAutomaticCashdrawerStartAddChange().then(() => {
                    this.updateCounter();
                });
            }
        });
        onWillUnmount(() => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.closed = true;
        });
    }

    async updateCounter() {
        await this.pos.callAutomaticCashdrawerGetAmountAccepted().then((res) => {
            if (this.closed) {
                return;
            }
            this.inputBuffer.value = res;
            // Auto accept dialog if amount is enough
            const {to_collect, auto_accept} = this.props;
            if (to_collect && auto_accept && this.inputBuffer.value >= to_collect) {
                return this.onClickConfirm();
            }
            this.timer = setTimeout(async () => {
                this.updateCounter();
            }, 1000);
        });
    }

    async onClickCancel() {
        if (this.props.allow_cancel) {
            try {
                this.ui.block();
                await this.pos.callAutomaticCashdrawerStopAcceptance().then((value) => {
                    this.pos.callAutomaticCashdrawerDispense(value);
                });
            } catch {
                this.dialog.add(AlertDialog, {
                    title: _t("Error"),
                    body: _t("An error occurred during the cancel."),
                });
            } finally {
                this.ui.unblock();
                this.props.close();
                this.props.cancelCashIn();
                this.notification.add(_t("Transaction Cancelled"), {type: "success"});
            }
        } else {
            this.dialog.add(AlertDialog, {
                title: _t("Failed"),
                body: _t("Cancel not enable"),
            });
        }
    }

    async onClickConfirm() {
        try {
            this.loading.value = false;
            this.ui.block();
            await this.pos
                .callAutomaticCashdrawerStopAcceptance()
                .then(async (response) => {
                    const {to_collect} = this.props;
                    if (to_collect && response >= to_collect) {
                        const rounding = this.pos.currency.rounding;
                        const change = roundPrecision(response - to_collect, rounding);
                        if (change > 0) {
                            // More was collected, we dispense
                            await this.pos
                                .callAutomaticCashdrawerDispense(change)
                                .then(() => {
                                    this.props.confirmCashIn(response);
                                });
                        } else {
                            // Exact amount was collected
                            this.props.confirmCashIn(response);
                        }
                    } else {
                        // Not enough was collected
                        this.props.confirmCashIn(response);
                    }
                });
        } catch {
            this.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: _t("An error occurred during the confirm."),
            });
        } finally {
            this.ui.unblock();
            this.props.close();
            this.notification.add(_t("Transaction Success"), {type: "success"});
        }
    }
}
