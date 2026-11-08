// Copyright 2026 Open Source Integrators
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
//
// PyWebDriver mode (use_pywebdriver=True) is mutually exclusive with pos_iot.
// The server shim (_load_pos_data_read) sets is_posbox=True, proxy_ip, and
// iface_print_via_proxy=True so the base POS proxy flow connects automatically.
//
// This patch remaps drivers.escpos → drivers.printer so PyWebDriver's
// status_json response is recognised by the ProxyStatus indicator.
// Core HardwareProxy.connectToPrinter() already uses HWPrinter with the
// proxy URL, so no custom printer logic is needed.

import {HardwareProxy} from "@point_of_sale/app/services/hardware_proxy_service";
import {patch} from "@web/core/utils/patch";

patch(HardwareProxy.prototype, {
    setConnectionInfo(info) {
        // Remap drivers.escpos to drivers.printer so PyWebDriver's status_json
        // response is recognised by the ProxyStatus indicator.
        if (info.drivers?.escpos && !info.drivers?.printer) {
            const modifiedInfo = Object.assign({}, info, {
                drivers: Object.assign({}, info.drivers, {
                    printer: info.drivers.escpos,
                }),
            });
            super.setConnectionInfo(modifiedInfo);
        } else {
            super.setConnectionInfo(info);
        }
    },
});
