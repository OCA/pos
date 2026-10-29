/** @odoo-module */

import {_t} from "@web/core/l10n/translation";
import {formatFloat} from "@web/core/utils/numbers";

/**
 * Round a tender rate to six significant digits.
 *
 * @param {Number} rate foreign-currency units per one Point of Sale unit
 * @returns {Number}
 */
export function roundForeignRate(rate) {
    if (!rate) {
        return 0;
    }
    const magnitude = Math.floor(Math.log10(Math.abs(rate)));
    const decimals = 6 - magnitude - 1;
    const factor = Math.pow(10, decimals);
    return Math.round(rate * factor) / factor;
}

/**
 * Format a tender rate with the user separators and no trailing zeros.
 *
 * @param {Number} rate foreign-currency units per one Point of Sale unit
 * @returns {String}
 */
export function formatForeignRate(rate) {
    const rounded = roundForeignRate(rate);
    if (!rounded) {
        return formatFloat(0, {digits: [69, 0], trailingZeros: false});
    }
    const magnitude = Math.floor(Math.log10(Math.abs(rounded)));
    const decimals = Math.max(0, 6 - magnitude - 1);
    return formatFloat(rounded, {digits: [69, decimals], trailingZeros: false});
}

/**
 * Label of the form "1 <POS currency> = <rate> <foreign currency>".
 *
 * @param {String} posCurrencyName
 * @param {Number} rate
 * @param {String} foreignName
 * @returns {String}
 */
export function foreignRateLabel(posCurrencyName, rate, foreignName) {
    return _t("1 %(pos_currency)s = %(rate)s %(foreign_currency)s", {
        pos_currency: posCurrencyName,
        rate: formatForeignRate(rate),
        foreign_currency: foreignName,
    });
}
