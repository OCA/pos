/* global QUnit */

import "@pos_customer_display_monitor/app/navbar.esm";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {Navbar} from "@point_of_sale/app/navbar/navbar";
import {SelectionPopup} from "@point_of_sale/app/utils/input_popups/selection_popup";

function makePos(id = 7) {
    return {
        config: {
            id,
            iface_customer_facing_display: true,
            iface_customer_facing_display_via_proxy: false,
        },
    };
}

function makeScreen({
    label,
    width,
    height,
    availWidth,
    availHeight,
    left,
    top,
    isPrimary,
}) {
    return {
        label,
        width,
        height,
        availWidth,
        availHeight,
        left,
        top,
        isPrimary,
    };
}

QUnit.module("pos_customer_display_monitor: navbar flow", {
    beforeEach() {
        this.originalGetScreenDetails = window.getScreenDetails;
        window.localStorage.removeItem("pos_customer_display_monitor.7");
    },
    afterEach() {
        if (this.originalGetScreenDetails) {
            window.getScreenDetails = this.originalGetScreenDetails;
        } else {
            delete window.getScreenDetails;
        }
        window.localStorage.removeItem("pos_customer_display_monitor.7");
    },
});

QUnit.test(
    "selectCustomerDisplayScreen shows unsupported popup when API is unavailable",
    async (assert) => {
        assert.expect(4);
        delete window.getScreenDetails;

        let closeMenuCalls = 0;
        const popup = {
            add(PopupType, props) {
                assert.strictEqual(PopupType, ErrorPopup);
                assert.strictEqual(props.title, "Screen selection is not supported");
                return Promise.resolve({});
            },
        };
        const ctx = {
            pos: makePos(),
            popup,
            closeMenu() {
                closeMenuCalls += 1;
            },
            selectCustomerDisplayScreenPopUp() {
                assert.step("unexpected-popup-selector");
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreen.call(ctx);

        assert.strictEqual(closeMenuCalls, 1);
        assert.verifySteps([]);
    }
);

QUnit.test(
    "selectCustomerDisplayScreen shows permission popup when screen API throws",
    async (assert) => {
        assert.expect(3);
        window.getScreenDetails = async () => {
            throw new TypeError("Permission denied");
        };

        const popup = {
            add(PopupType, props) {
                assert.strictEqual(PopupType, ErrorPopup);
                assert.strictEqual(props.title, "Screen permission required");
                return Promise.resolve({});
            },
        };
        const ctx = {
            pos: makePos(),
            popup,
            closeMenu() {
                return undefined;
            },
            selectCustomerDisplayScreenPopUp() {
                assert.step("unexpected-popup-selector");
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreen.call(ctx);
        assert.verifySteps([]);
    }
);

QUnit.test(
    "selectCustomerDisplayScreen shows no screens popup when browser returns empty list",
    async (assert) => {
        assert.expect(2);
        window.getScreenDetails = async () => ({screens: []});

        const popup = {
            add(PopupType, props) {
                assert.strictEqual(PopupType, ErrorPopup);
                assert.strictEqual(props.title, "No screens detected");
                return Promise.resolve({});
            },
        };
        const ctx = {
            pos: makePos(),
            popup,
            closeMenu() {
                return undefined;
            },
            selectCustomerDisplayScreenPopUp() {
                return undefined;
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreen.call(ctx);
    }
);

QUnit.test(
    "selectCustomerDisplayScreen delegates to selector popup with computed selected screen",
    async (assert) => {
        assert.expect(4);
        const primary = makeScreen({
            label: "Main",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 0,
            top: 0,
            isPrimary: true,
        });
        const customer = makeScreen({
            label: "Customer",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 1920,
            top: 0,
            isPrimary: false,
        });
        window.getScreenDetails = async () => ({screens: [primary, customer]});
        window.localStorage.setItem(
            "pos_customer_display_monitor.7",
            JSON.stringify({
                label: "Customer",
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1040,
                left: 1920,
                top: 0,
                isPrimary: false,
            })
        );

        const ctx = {
            pos: makePos(),
            popup: {
                add() {
                    throw new Error("Not expected in this path");
                },
            },
            closeMenu() {
                return undefined;
            },
            async selectCustomerDisplayScreenPopUp(screens, saved, selectedScreen) {
                assert.strictEqual(screens.length, 2);
                assert.strictEqual(saved.label, "Customer");
                assert.strictEqual(selectedScreen, customer);
                assert.strictEqual(selectedScreen.isPrimary, false);
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreen.call(ctx);
    }
);

QUnit.test(
    "selectCustomerDisplayScreenPopUp confirm saves selection and reconnects customer display",
    async (assert) => {
        assert.expect(5);
        const payload = makeScreen({
            label: "Customer",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 1920,
            top: 0,
            isPrimary: false,
        });
        let closeCalled = 0;
        let connectCalled = 0;

        const ctx = {
            pos: makePos(),
            popup: {
                add(PopupType, props) {
                    assert.strictEqual(PopupType, SelectionPopup);
                    assert.strictEqual(props.list.length, 1);
                    return Promise.resolve({confirmed: true, payload});
                },
            },
            customerDisplay: {
                popupWindow: {
                    closed: false,
                    close() {
                        closeCalled += 1;
                    },
                },
                connect() {
                    connectCalled += 1;
                    return Promise.resolve();
                },
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreenPopUp.call(
            ctx,
            [payload],
            null,
            payload
        );

        const saved = JSON.parse(
            window.localStorage.getItem("pos_customer_display_monitor.7")
        );
        assert.strictEqual(saved.label, "Customer");
        assert.strictEqual(closeCalled, 1);
        assert.strictEqual(connectCalled, 1);
    }
);

QUnit.test(
    "selectCustomerDisplayScreenPopUp cancel does not save or reconnect",
    async (assert) => {
        assert.expect(3);
        const screen = makeScreen({
            label: "Customer",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 1920,
            top: 0,
            isPrimary: false,
        });
        let connectCalled = 0;

        const ctx = {
            pos: makePos(),
            popup: {
                add(PopupType) {
                    assert.strictEqual(PopupType, SelectionPopup);
                    return Promise.resolve({confirmed: false, payload: null});
                },
            },
            customerDisplay: {
                connect() {
                    connectCalled += 1;
                    return Promise.resolve();
                },
            },
        };

        await Navbar.prototype.selectCustomerDisplayScreenPopUp.call(
            ctx,
            [screen],
            null,
            screen
        );

        assert.strictEqual(
            window.localStorage.getItem("pos_customer_display_monitor.7"),
            null
        );
        assert.strictEqual(connectCalled, 0);
    }
);
