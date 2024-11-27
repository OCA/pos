/** @odoo-module */

import {OrderWidget} from "@point_of_sale/app/generic_components/order_widget/order_widget";
import {patch} from "@web/core/utils/patch";
import {_t} from "@web/core/l10n/translation";

patch(OrderWidget.prototype, {
    getTotalQuantity() {
        if (!this.props && !this.props.lines) {
            return 0;
        }
        return (
            _t("Number of articles") +
            ": " +
            this.props.lines.reduce((total, line) => total + line.quantity, 0)
        );
    },
});
