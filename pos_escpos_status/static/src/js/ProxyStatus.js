/* Copyright (C) 2020-Today Akretion (https://www.akretion.com)
    @author Pierrick Brun (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_escpos_status.ProxyStatus", function (require) {
    "use strict";
    var Registries = require("point_of_sale.Registries");
    var ProxyStatus = require("point_of_sale.ProxyStatus");

    const EscposProxyStatus = (ProxyStatus) =>
        class EscposProxyStatus extends ProxyStatus {
            _setStatus(newStatus) {
                if (newStatus.drivers.escpos) {
                    newStatus.drivers.printer = newStatus.drivers.escpos;
                }
                super._setStatus(newStatus);
            }
        };

    Registries.Component.extend(ProxyStatus, EscposProxyStatus);
});
