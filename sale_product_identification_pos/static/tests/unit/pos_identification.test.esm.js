import "sale_product_identification_pos/static/src/app/store/pos_store.esm.js";

import {expect, test} from "@odoo/hoot";
import {ConnectionLostError} from "@web/core/network/rpc";
import {PosStore} from "@point_of_sale/app/store/pos_store";

function makeStore(overrides = {}) {
    const store = {
        dialog: {
            add() {
                return undefined;
            },
        },
        data: {
            orm: {
                async call() {
                    return true;
                },
            },
        },
        get_order() {
            return {
                partner_id: null,
                not_verify_identification: false,
                lines: [],
            };
        },
        set_order() {
            return undefined;
        },
        _get_products_requiring_identification() {
            return [];
        },
        _is_identification_enforced() {
            return false;
        },
        _is_browser_offline() {
            return false;
        },
        _show_enforced_block_message() {
            return undefined;
        },
        _prepare_identification_batches() {
            return [];
        },
        ...overrides,
    };
    return store;
}

test("_warn_offline_identification requires confirmation", async () => {
    const store = makeStore();
    store.dialog.add = (component, props) => {
        props.cancel();
    };
    const cancelled = await PosStore.prototype._warn_offline_identification.call(
        store,
        ["Explosive"]
    );
    expect(cancelled).toBe(false);

    store._identificationOfflineWarned = false;
    store.dialog.add = (component, props) => {
        props.confirm();
    };
    const confirmed = await PosStore.prototype._warn_offline_identification.call(
        store,
        ["Explosive"]
    );
    expect(confirmed).toBe(true);
});

test("_perform_identification_checks blocks enforced sales without partner", async () => {
    const store = makeStore({
        _is_identification_enforced: () => true,
        _get_products_requiring_identification: () => ["Explosive"],
        _show_enforced_block_message: () => expect.step("blocked"),
    });
    const order = {partner_id: null, not_verify_identification: false, lines: []};
    const result = await PosStore.prototype._perform_identification_checks.call(
        store,
        order
    );
    expect(result).toBe(false);
    expect.verifySteps(["blocked"]);
});

test("validate_order_identification asks for confirmation when offline", async () => {
    const offlineError = new ConnectionLostError();
    const store = makeStore({
        data: {
            orm: {
                async call() {
                    throw offlineError;
                },
            },
        },
        _warn_offline_identification: () => {
            expect.step("warned");
            return Promise.resolve(true);
        },
    });
    const result = await PosStore.prototype.validate_order_identification.call(
        store,
        [1],
        true,
        {enforced: false, products: ["Explosive"]}
    );
    expect(result).toBe(true);
    expect.verifySteps(["warned"]);
});
