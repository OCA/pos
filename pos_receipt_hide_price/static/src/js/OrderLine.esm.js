/** @odoo-module */

import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {patch} from "@web/core/utils/patch";

// Patch the static props to include priceHidden
patch(Orderline, {
    props: {
        ...Orderline.props,
        priceHidden: {type: Boolean, optional: true},
    },
});
