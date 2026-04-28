/** @odoo-module **/
/* global */

import {posPrinterService} from "@point_of_sale/app/services/pos_printer_service";
import {QZTrayPrinter} from "../printer/qz_tray_printer.esm";
import {registry} from "@web/core/registry";
import {rpc} from "@web/core/network/rpc";

export const QZTrayPrinterService = {
    dependencies: ["hardware_proxy"],
    async start(env, {hardware_proxy}) {
        let printerName = "QZTray";

        try {
            const posConfigId = odoo.pos_config_id;
            if (posConfigId) {
                const result = await rpc("/web/dataset/call_kw", {
                    model: "pos.config",
                    method: "read",
                    args: [[posConfigId], ["iface_qztray_printer_id"]],
                    kwargs: {},
                });

                const config = result?.[0];
                if (config?.iface_qztray_printer_id) {
                    printerName = config.iface_qztray_printer_id[1];
                    console.info(`[POS][QZTray] Printer from backend: ${printerName}`);
                }
            } else {
                console.warn("[POS][QZTray] No pos_config_id found in odoo global.");
            }
        } catch (error) {
            console.error("[POS][QZTray] Could not fetch printer config", error);
        }

        const device = new QZTrayPrinter(printerName, "escpos");
        hardware_proxy.printer = device;

        console.info(`[POS][QZTray] Printer service initialized: ${printerName}`);

        posPrinterService.start(env, {hardware_proxy});
    },
};

registry.category("services").add("printer.qztray", QZTrayPrinterService);
