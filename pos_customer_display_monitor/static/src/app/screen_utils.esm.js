/** @odoo-module **/

/**
 * Copyright 2026 (APSL - Nagarro) Bernat Obrador
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

export const STORAGE_PREFIX = "pos_customer_display_monitor";
export const DEFAULT_WIDTH = 900;
export const DEFAULT_HEIGHT = 600;

export function storageKey(pos) {
    return `${STORAGE_PREFIX}.${pos.config.uuid || pos.config.id}`;
}

export function getSavedScreen(pos) {
    try {
        return JSON.parse(window.localStorage.getItem(storageKey(pos)) || "null");
    } catch (error) {
        console.info("Could not read saved customer display screen", error);
        return null;
    }
}

export function screenFingerprint(screen) {
    return {
        label: screen.label || "",
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        left: screen.left,
        top: screen.top,
        isPrimary: Boolean(screen.isPrimary),
    };
}

export function saveScreen(pos, screen) {
    try {
        window.localStorage.setItem(
            storageKey(pos),
            JSON.stringify(screenFingerprint(screen))
        );
    } catch (error) {
        console.info("Could not persist customer display screen", error);
    }
}

export async function getScreens() {
    if (!("getScreenDetails" in window)) {
        return null;
    }

    const details = await window.getScreenDetails();
    return details.screens || [];
}

export function windowFeatures(screen) {
    if (!screen) {
        return ["popup=yes", `width=${DEFAULT_WIDTH}`, `height=${DEFAULT_HEIGHT}`].join(
            ","
        );
    }

    const left = screen.availLeft ?? screen.left ?? 0;
    const top = screen.availTop ?? screen.top ?? 0;
    const width = screen.availWidth ?? screen.width ?? DEFAULT_WIDTH;
    const height = screen.availHeight ?? screen.height ?? DEFAULT_HEIGHT;

    return [
        "popup=yes",
        `left=${Math.round(left)}`,
        `top=${Math.round(top)}`,
        `width=${Math.round(width)}`,
        `height=${Math.round(height)}`,
        "resizable=yes",
        "scrollbars=no",
    ].join(",");
}

export function maximizeToScreen(popupWindow, screen) {
    if (!popupWindow || popupWindow.closed || !screen) {
        return;
    }

    try {
        popupWindow.moveTo(
            screen.availLeft ?? screen.left ?? popupWindow.screenX,
            screen.availTop ?? screen.top ?? popupWindow.screenY
        );

        popupWindow.resizeTo(
            screen.availWidth ?? screen.width ?? popupWindow.outerWidth,
            screen.availHeight ?? screen.height ?? popupWindow.outerHeight
        );
    } catch (error) {
        console.info("Browser refused to move or resize the customer display", error);
    }
}

export function scoreScreen(screen, saved) {
    if (!saved) {
        return -1;
    }

    let score = 0;

    if (saved.label && screen.label === saved.label) {
        score += 100;
    }

    if (screen.width === saved.width && screen.height === saved.height) {
        score += 30;
    }

    if (
        screen.availWidth === saved.availWidth &&
        screen.availHeight === saved.availHeight
    ) {
        score += 20;
    }

    if (screen.left === saved.left && screen.top === saved.top) {
        score += 15;
    }

    if (Boolean(screen.isPrimary) === saved.isPrimary) {
        score += 5;
    }

    return score;
}

export function chooseBestScreen(screens, saved) {
    if (!screens.length) {
        return null;
    }

    if (!saved) {
        return screens.find((screen) => !screen.isPrimary) || screens[0];
    }

    return [...screens].sort(
        (screenA, screenB) => scoreScreen(screenB, saved) - scoreScreen(screenA, saved)
    )[0];
}
