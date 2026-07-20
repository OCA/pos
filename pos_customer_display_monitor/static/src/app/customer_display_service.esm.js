/** @odoo-module */

/**
 * Copyright 2026 (APSL - Nagarro) Bernat Obrador
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

import {LocalDisplay} from "@point_of_sale/app/customer_display/customer_display_service";
import {patch} from "@web/core/utils/patch";
import {
    chooseBestScreen,
    getSavedScreen,
    getScreens,
    maximizeToScreen,
    windowFeatures,
} from "@pos_customer_display_monitor/app/screen_utils.esm";

patch(LocalDisplay.prototype, {
    async connect() {
        if (this.popupWindow && !this.popupWindow.closed) {
            return;
        }

        let targetScreen = null;

        try {
            const screens = await getScreens();

            if (screens) {
                targetScreen = chooseBestScreen(screens, getSavedScreen(this.pos));
            }
        } catch (error) {
            console.info("Customer display screen selection unavailable", error);
        }

        this.popupWindow = window.open(
            "",
            "Customer Display",
            windowFeatures(targetScreen)
        );

        if (!this.popupWindow || this.popupWindow.closed) {
            this.setPopupWindowLastStatus(false);
            return;
        }

        this.setPopupWindowLastStatus(true);

        this.popupWindow.addEventListener("beforeunload", () => {
            this.setPopupWindowLastStatus(false);
        });

        await this.update({
            refreshResources: true,
        });
        maximizeToScreen(this.popupWindow, targetScreen);
    },
});
