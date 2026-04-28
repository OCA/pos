/** @odoo-module **/
/* global */

import {htmlToCanvas} from "@point_of_sale/app/services/render_service";
import {QZConnection} from "./qz_tray_connection.esm";
import {rpc} from "@web/core/network/rpc";

/**
 * QZTrayPrinter
 * -------------
 * POS printer driver that uses QZ Tray to send ESC/POS commands.
 * It relies on the native Odoo receipt rendering flow:
 * HTML receipt -> PNG -> ESC/POS image bytes -> QZ Tray.
 */
export class QZTrayPrinter {
    constructor(name) {
        this.name = name || "QZTray Printer";
        this.type = "qztray";
    }

    /**
     * Print a POS receipt element by converting its HTML to ESC/POS.
     * @param {HTMLElement} el - The HTML element representing the receipt.
     * @returns {Promise<{successful: boolean, message?: object}>}
     */
    async printReceipt(el) {
        let activeConnection = false;

        try {
            const canvas = await htmlToCanvas(el, {addClass: "pos-receipt-print"});
            const pngBase64 = canvas
                .toDataURL("image/png")
                .replace(/^data:image\/png;base64,/, "");
            const escpos_data = await rpc("/pos/escpos/render-image", {
                png_base64: pngBase64,
            });
            const cashdrawer = "\x1B\x70\x00\x19\x19";
            activeConnection = true;
            await QZConnection.print(this.name, [
                {
                    type: "raw",
                    format: "base64",
                    data: escpos_data,
                },
                cashdrawer,
            ]);

            return {successful: true};
        } catch (error) {
            console.error("[POS][QZTray] Printing error:", error);
            return {
                successful: false,
                message: {
                    title: "Printing Error",
                    body: error.message || "Unable to print using QZ Tray.",
                },
            };
        } finally {
            if (activeConnection) {
                try {
                    await QZConnection.disconnect();
                } catch {
                    /* Ignore */
                }
            }
        }
    }

    async openCashbox() {
        try {
            const opencashcommand = "\x1B\x70\x00\x19\x19";
            await QZConnection.print(this.name, [
                {type: "raw", format: "base64", data: opencashcommand},
                opencashcommand,
            ]);
            return {successful: true};
        } catch (error) {
            console.error("[POS][QZTray] ESC/POS Open Chasdrawer error:", error);
            return {
                successful: false,
                message: {
                    title: "ESC/POS Print Error",
                    body: error.message || "Could not open chashdrawer via QZ Tray.",
                },
            };
        } finally {
            try {
                await QZConnection.disconnect();
            } catch {
                /* Ignore disconnect errors */
            }
        }
    }
}
