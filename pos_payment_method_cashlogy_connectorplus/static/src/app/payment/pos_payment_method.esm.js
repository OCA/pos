import {Base} from "@point_of_sale/app/models/related_models";
import {registry} from "@web/core/registry";

export class PosPaymentMethod extends Base {
    static pythonModel = "pos.payment.method";
    // Cashlogy machines need to be initialized when starting the POS
    async cashlogy_init_session() {
        // We first check if cashlogy terminal is initialized,
        // If initialized, we do nothing,
        // If idle, we init it.
        // If initializing we wait for it to be readyy
        const status_data = await this._cashlogy_request_init_status();
        if (status_data.status === "FINISHED") {
            return true;
        }
        if (status_data.status === "IDLE") {
            await this._cashlogy_request_init_session();
        }
        // (status_data.status === "INITIALIZING") also leads here
        await this._cashlogy_wait_init_done();
        return true;
    }
    async cashlogy_close_session() {
        return await this._cashlogy_request_close_session();
    }

    // Request methods
    _cashlogy_url() {
        return `${this.cashlogy_url}/connectorPlus`;
    }
    async _cashlogy_request(url, method, data) {
        const request_params = {
            method: method,
        };
        const headers = {"x-api-key": this.cashlogy_api_key};
        if (data && Object.keys(data).length > 0) {
            request_params.body = JSON.stringify(data);
            headers["content-type"] = "application/json";
        }
        request_params.headers = headers;
        console.info(`Sending request to ${url}`);
        const response = await fetch(url, request_params);
        if (!response.ok) {
            return await response.text();
        }
        return await response.json();
    }
    async _cashlogy_request_init_session() {
        const url = `${this._cashlogy_url()}/init`;
        return await this._cashlogy_request(url, "POST", false);
    }
    async _cashlogy_request_close_session() {
        const url = `${this._cashlogy_url()}/close`;
        return await this._cashlogy_request(url, "POST", false);
    }
    async _cashlogy_request_init_status() {
        const url = `${this._cashlogy_url()}/init/status`;
        return await this._cashlogy_request(url, "GET", false);
    }
    async _cashlogy_request_payment_start(amount, ticket_num) {
        const types = {
            cash: "CASH",
            bank: "CASHLESS",
        };
        const data = {
            price: amount,
            ticketNumber: ticket_num,
            machineCode: "machine-123",
            secondScreen: false,
            processManually: false,
            screenVisible: true,
            topMost: false,
            // SELECTION, CASH, CASHLESS, tbd.
            type: types[this.type] || "SELECTION",
            peripheralId: "",
        };
        const url = `${this._cashlogy_url()}/charge`;
        return await this._cashlogy_request(url, "POST", data);
    }
    async _cashlogy_request_dispense_start(amount) {
        const data = {
            amount: amount,
            onlyCoins: false,
            screenVisible: true,
            topMost: false,
        };
        const url = `${this._cashlogy_url()}/dispense`;
        return await this._cashlogy_request(url, "POST", data);
    }
    async _cashlogy_request_open_back_office() {
        const data = {
            operations: {
                addChange: true,
                giveChange: true,
                closure: true,
                withdrawCash: true,
                collect: true,
                completeEmpty: true,
                cashlogyState: true,
                recyclersSelfprotection: true,
                accountingMismatch: true,
                maintenance: true,
            },
            topMost: true,
        };
        const url = `${this._cashlogy_url()}/backOffice`;
        return await this._cashlogy_request(url, "POST", data);
    }

    async _cashlogy_request_payment_status() {
        const url = `${this._cashlogy_url()}/charge/status`;
        return await this._cashlogy_request(url, "GET", false);
    }
    async _cashlogy_request_dispense_status() {
        const url = `${this._cashlogy_url()}/dispense/status`;
        return await this._cashlogy_request(url, "GET", false);
    }

    async _cashlogy_wait_init_done() {
        const data = await this._cashlogy_request_init_status();
        if (data.result === "FINISHED") {
            return data;
        }
        if (["INITIALIZING", "IN_PROGRESS"].includes(data.result)) {
            console.log(data);
            throw new Error(
                `Unexpected state when waiting for initialization to be done: ${data.result}`
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await this._cashlogy_wait_init_done();
    }
    async _cashlogy_wait_payment_done(payment_key) {
        const data = await this._cashlogy_request_payment_status();
        if (!(payment_key in data)) {
            console.log("Operation not found");
        }
        if (data[payment_key].result === "SUCCESS") {
            return data[payment_key];
        }
        if (data[payment_key].result === "CANCELLED") {
            return false;
        }
        if (data[payment_key].status in ["DISPENSE_FAILED", "ADD_CHARGE"]) {
            // TODO: Add a warning to the user to show machine has no change.
        }
        if (data[payment_key].result !== "IN_PROGRESS") {
            console.log(data);
            throw new Error(
                `Unexpected state when waiting for payment to be done: ${data[payment_key].result}`
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this._cashlogy_wait_payment_done(payment_key);
    }
    async _cashlogy_wait_dispense_done() {
        const data = await this._cashlogy_request_dispense_status();
        if (data.result === "SUCCESS") {
            return data;
        }

        if (data.status in ["DISPENSE_FAILED", "ADD_CHARGE"]) {
            // TODO: Add a warning to the user to show machine has no change.
        }
        if (data.result !== "IN_PROGRESS") {
            console.log(data);
            throw new Error(
                `Unexpected state when waiting for charge to be done: ${data.result}`
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this._cashlogy_wait_dispense_done();
    }
    async _cashlogy_get_payment_statuses() {
        const data = await this._cashlogy_request_payment_status();
        const res = {};
        for (const [key, value] of Object.entries(data)) {
            res[key] = value.result;
        }
        return res;
    }
}

registry
    .category("pos_available_models")
    .add(PosPaymentMethod.pythonModel, PosPaymentMethod);
