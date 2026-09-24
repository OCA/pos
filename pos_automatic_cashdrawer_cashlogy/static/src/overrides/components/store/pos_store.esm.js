import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async checkCashInOutPossible() {
        const result = await this.data.call(
            "pos.session",
            "js_check_cash_in_out_possible",
            [this.session.id]
        );
        if (result.error) {
            this.dialog.add(AlertDialog, {
                title: _t("Error"),
                body: result.message,
            });
        }
    },
    async actionPutMoneyIn(amount, reason, extras) {
        const res = await this.data.call("pos.session", "action_put_money_in", [
            [this.session.id],
            amount,
            reason,
            extras,
        ]);
        return res;
    },
    async actionTakeMoneyOut(amount, reason, extras) {
        const res = await this.data.call("pos.session", "action_take_money_out", [
            [this.session.id],
            amount,
            reason,
            extras,
        ]);
        return res;
    },

    /**
     * CALL CASHLOGY METHODS
     **/

    async callAutomaticCashdrawerDisplayTransactionStart(amount, options = {}) {
        try {
            this.ui.block();
            const res = await this.sendCashlogy("cashlogy/display_transaction_start", {
                amount: amount,
                options: options,
            });
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    },

    async callAutomaticCashlogyDisplayBackoffice() {
        try {
            this.ui.block();
            const res = await this.sendCashlogy("cashlogy/display_backoffice", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    },

    /*
        Dispenses money
        amount              float
        options.only_coins  default False

        @returns 0.00
    */
    async callAutomaticCashdrawerDispense(amount, options = {}) {
        try {
            const res = await this.sendCashlogy("cashlogy/dispense", {
                amount: amount,
                options: options,
            });
            if (res !== amount) {
                const message = _t(
                    "Cashlogy: The dispensed amount was different than the requested"
                );
                console.error(message);
                this.notification.add(message, {type: "warning"});
            } else {
                const res_formatted = this.formatCurrencyCashlogy(res);
                this.notification.add(
                    _t(`Successfully made a dispend amount of ${res_formatted}`),
                    {type: "success"}
                );
            }
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Start add change
        Used to load money into the cashdrawer
        It has to be stopped using stop_acceptance
        The amount loaded so far can be queried with get_amount_accepted
    */
    async callAutomaticCashdrawerStartAddChange() {
        try {
            const res = await this.sendCashlogy("cashlogy/start_add_change", {});
            const res_formatted = this.formatCurrencyCashlogy(res);
            this.notification.add(
                _t(`Successfully load money into the cashdrawer of ${res_formatted}`),
                {type: "success"}
            );
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Start acceptance
        Similar to Start add change, but used for sales
        It has to be stopped using stop_acceptance
        The amount loaded so far can be queried with get_amount_accepted
    */
    async callAutomaticCashdrawerStartAcceptance() {
        try {
            const res = await this.sendCashlogy("cashlogy/start_acceptance", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },
    /*
        Returns the money accepted so far
        @returns 0.00
    */
    async callAutomaticCashdrawerGetAmountAccepted() {
        try {
            const res = await this.sendCashlogy("cashlogy/get_amount_accepted", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Stops acceptance of money
        @returns 0.00
    */
    async callAutomaticCashdrawerStopAcceptance() {
        try {
            const res = await this.sendCashlogy("cashlogy/stop_acceptance", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Gets the inventory of the machine
        Returns {total: {} recycler: {} stacker: {}}
    */
    async callAutomaticCashdrawerGetInventory() {
        try {
            const res = await this.sendCashlogy("cashlogy/get_inventory", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Gets the total amount on the machine
        Returns {total: 0.00, recycler: 0.00, stacker: 0.00}
    */
    async callAutomaticCashdrawerGetTotalAmount() {
        try {
            const res = await this.sendCashlogy("cashlogy/get_total_amount", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        }
    },

    /*
        Display Close Till
        @returns    {total_before: 0.00, added: 0.00, dispensed: 0.00, total: 0.00}
    */
    async callAutomaticCashdrawerDisplayCloseTill() {
        try {
            this.ui.block();
            const res = await this.sendCashlogy("cashlogy/display_close_till", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    },

    /*
        Displays the backoffice empty stacker wizard.
        @returns    0.00 - the amount removed from stacker
    */
    async callAutomaticCashdrawerEmptyStacker() {
        try {
            this.ui.block();
            const res = await this.sendCashlogy("cashlogy/display_empty_stacker", {});
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    },

    /*
        Displays the backoffice complete emptying wizard.
        @returns    0.00 - the dispensed amount
    */
    async callAutomaticCashdrawerDisplayCompleteEmptying() {
        try {
            this.ui.block();
            const res = await this.sendCashlogy(
                "cashlogy/display_complete_emptying",
                {}
            );
            return res;
        } catch (error) {
            this.showErrorCashlogy(error);
        } finally {
            this.ui.unblock();
        }
    },

    /**
     * HELPERS
     **/

    async sendCashlogy(name, params) {
        const response = await this.hardwareProxy.message(name, params);
        const data = response.json();
        return data.result;
    },

    showErrorCashlogy(error) {
        this.dialog.closeAll();
        const message = error
            ? error?.message
            : _t("Make sure Cashdrawer connected with IOT Box");
        this.dialog.add(AlertDialog, {
            title: _t("Cashdrawer Error"),
            body: message,
        });
    },

    formatCurrencyCashlogy(value) {
        const number = Number(value) || 0;
        return this.env.utils.formatCurrency(number);
    },
});
