/** @odoo-module */

/**
 * Copyright 2026 (APSL - Nagarro) Bernat Obrador
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

import {
    chooseBestScreen,
    getSavedScreen,
    getScreens,
    saveScreen,
} from "@pos_customer_display_monitor/app/screen_utils.esm";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {Navbar} from "@point_of_sale/app/navbar/navbar";
import {SelectionPopup} from "@point_of_sale/app/utils/input_popups/selection_popup";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(Navbar.prototype, {
    setup() {
        super.setup(...arguments);
        this.customerDisplay = useService("customer_display");
        this.popup = useService("popup");
    },

    get showCustomerDisplayScreenSelector() {
        return Boolean(
            this.pos.config.iface_customer_facing_display &&
                !this.pos.config.iface_customer_facing_display_via_proxy
        );
    },

    async selectCustomerDisplayScreenPopUp(screens, saved, selectedScreen) {
        const list = screens.map((screen, index) => ({
            id: index,
            item: screen,
            label:
                `${screen.label || _t("Screen")} ` +
                `${index + 1} — ` +
                `${screen.width}×${screen.height}` +
                `${screen.isPrimary ? ` (${_t("primary")})` : ""}`,
            isSelected: screen === selectedScreen,
        }));

        const {confirmed, payload} = await this.popup.add(SelectionPopup, {
            title: _t("Select the customer display"),
            list,
        });

        if (!confirmed || !payload) {
            return;
        }

        saveScreen(this.pos, payload);

        if (
            this.customerDisplay?.popupWindow &&
            !this.customerDisplay.popupWindow.closed
        ) {
            this.customerDisplay.popupWindow.close();
            this.customerDisplay.popupWindow = null;
        }

        await this.customerDisplay?.connect();
    },

    async selectCustomerDisplayScreen() {
        this.closeMenu();

        if (!("getScreenDetails" in window)) {
            await this.popup.add(ErrorPopup, {
                title: _t("Screen selection is not supported"),
                body: _t(
                    "Use a recent Chromium-based browser and serve Odoo over HTTPS."
                ),
            });
            return;
        }

        let screens = [];

        try {
            screens = await getScreens();
        } catch (error) {
            console.info("Could not retrieve screen details", error);

            await this.popup.add(ErrorPopup, {
                title: _t("Screen permission required"),
                body: _t(
                    "Allow window management permission in the browser and try again."
                ),
            });
            return;
        }

        if (!screens?.length) {
            await this.popup.add(ErrorPopup, {
                title: _t("No screens detected"),
                body: _t("The browser did not return any connected screens."),
            });
            return;
        }

        const saved = getSavedScreen(this.pos);
        const selectedScreen = chooseBestScreen(screens, saved);

        await this.selectCustomerDisplayScreenPopUp(screens, saved, selectedScreen);
    },
});
