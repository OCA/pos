/** @odoo-module */
/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/

import {Order} from "@point_of_sale/app/store/models";
import {patch} from "@web/core/utils/patch";

patch(Order.prototype, {
    async setup() {
        this.create_new_line = false;
        await super.setup(...arguments);
    },
    add_product() {
        super.add_product(...arguments);
        this.create_new_line = false;
    },
});
