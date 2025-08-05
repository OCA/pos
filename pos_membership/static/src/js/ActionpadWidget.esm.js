/** @odoo-module **/

import {formatDate, parseDate} from "@web/core/l10n/dates";
import ActionpadWidget from "point_of_sale.ActionpadWidget";
import {Component} from "point_of_sale.Registries";

const MembershipActionpadWidget = (OriginalActionpadWidget) =>
    class extends OriginalActionpadWidget {
        formatDate(date) {
            return formatDate(parseDate(date));
        }
    };

Component.extend(ActionpadWidget, MembershipActionpadWidget);
