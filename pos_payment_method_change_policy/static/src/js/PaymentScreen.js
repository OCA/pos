// @odoo-module

import {PaymentScreen} from "@point_of_sale/app/screens/payment_screen/payment_screen";
import {patch} from "@web/core/utils/patch";

let _methodCache = null;

// eslint-disable-next-line no-unused-vars
async function getMethodCache(orm) {
    if (_methodCache) return _methodCache;

    try {
        const rows = await orm.searchRead(
            "pos.payment.method",
            [["change_policy", "=", "profit_product"]],
            ["id"]
        );

        _methodCache = {};
        for (const r of rows) {
            _methodCache[r.id] = true;
        }
    } catch (e) {
        console.error("Payment method cache failed:", e);
        _methodCache = {};
    }

    return _methodCache;
}

patch(PaymentScreen.prototype, {
    // TODO: implement payment method change policy logic
});
