/* global QUnit */

import {
    chooseBestScreen,
    getScreens,
    maximizeToScreen,
    scoreScreen,
    screenFingerprint,
    storageKey,
    windowFeatures,
} from "@pos_customer_display_monitor/app/screen_utils.esm";

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

QUnit.module("pos_customer_display_monitor: screen utils");

QUnit.test("storageKey uses config uuid when available", (assert) => {
    const pos = {
        config: {
            uuid: "abc-uuid",
            id: 42,
        },
    };

    assert.strictEqual(storageKey(pos), "pos_customer_display_monitor.abc-uuid");
});

QUnit.test("storageKey falls back to config id", (assert) => {
    const pos = {
        config: {
            id: 42,
        },
    };

    assert.strictEqual(storageKey(pos), "pos_customer_display_monitor.42");
});

QUnit.test("screenFingerprint normalizes label and primary flag", (assert) => {
    const fingerprint = screenFingerprint({
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 0,
        top: 0,
        isPrimary: 1,
    });

    assert.deepEqual(fingerprint, {
        label: "",
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 0,
        top: 0,
        isPrimary: true,
    });
});

QUnit.test("scoreScreen returns -1 when no saved screen", (assert) => {
    const screen = makeScreen({
        label: "Display 1",
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 0,
        top: 0,
        isPrimary: true,
    });

    assert.strictEqual(scoreScreen(screen, null), -1);
});

QUnit.test("scoreScreen adds weighted matches", (assert) => {
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
    const saved = {
        label: "Customer",
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 1920,
        top: 0,
        isPrimary: false,
    };

    assert.strictEqual(scoreScreen(screen, saved), 170);
});

QUnit.test("chooseBestScreen prefers non-primary when no saved screen", (assert) => {
    const primary = makeScreen({
        label: "Primary",
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 0,
        top: 0,
        isPrimary: true,
    });
    const secondary = makeScreen({
        label: "Secondary",
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: 1920,
        top: 0,
        isPrimary: false,
    });

    assert.strictEqual(chooseBestScreen([primary, secondary], null), secondary);
});

QUnit.test(
    "chooseBestScreen picks highest score against saved fingerprint",
    (assert) => {
        const screenA = makeScreen({
            label: "A",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 0,
            top: 0,
            isPrimary: true,
        });
        const screenB = makeScreen({
            label: "Customer",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 1920,
            top: 0,
            isPrimary: false,
        });
        const screenC = makeScreen({
            label: "C",
            width: 1280,
            height: 720,
            availWidth: 1280,
            availHeight: 680,
            left: -1280,
            top: 0,
            isPrimary: false,
        });
        const saved = {
            label: "Customer",
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            left: 1920,
            top: 0,
            isPrimary: false,
        };

        assert.strictEqual(
            chooseBestScreen([screenA, screenB, screenC], saved),
            screenB
        );
    }
);

QUnit.test("chooseBestScreen returns null with empty list", (assert) => {
    assert.strictEqual(chooseBestScreen([], null), null);
});

QUnit.test("windowFeatures uses defaults when no screen is passed", (assert) => {
    assert.strictEqual(windowFeatures(null), "popup=yes,width=900,height=600");
});

QUnit.test("windowFeatures uses screen coordinates and size", (assert) => {
    const screen = {
        availLeft: 10.3,
        availTop: 20.7,
        availWidth: 1919.8,
        availHeight: 1039.2,
    };

    assert.strictEqual(
        windowFeatures(screen),
        "popup=yes,left=10,top=21,width=1920,height=1039,resizable=yes,scrollbars=no"
    );
});

QUnit.test(
    "getScreens returns null when Window Management API is unavailable",
    async (assert) => {
        const original = window.getScreenDetails;
        try {
            delete window.getScreenDetails;
            assert.strictEqual(await getScreens(), null);
        } finally {
            if (original) {
                window.getScreenDetails = original;
            }
        }
    }
);

QUnit.test("getScreens returns screens from browser API", async (assert) => {
    const original = window.getScreenDetails;
    const screens = [{label: "External"}];

    try {
        window.getScreenDetails = async () => ({screens});
        assert.strictEqual(await getScreens(), screens);
    } finally {
        if (original) {
            window.getScreenDetails = original;
        } else {
            delete window.getScreenDetails;
        }
    }
});

QUnit.test("maximizeToScreen moves and resizes popup", (assert) => {
    assert.expect(2);
    const popupWindow = {
        closed: false,
        screenX: 1,
        screenY: 2,
        outerWidth: 100,
        outerHeight: 200,
        moveTo(left, top) {
            assert.deepEqual([left, top], [300, 400]);
        },
        resizeTo(width, height) {
            assert.deepEqual([width, height], [1200, 900]);
        },
    };
    const screen = {
        availLeft: 300,
        availTop: 400,
        availWidth: 1200,
        availHeight: 900,
    };

    maximizeToScreen(popupWindow, screen);
});
