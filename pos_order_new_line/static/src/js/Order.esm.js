/*
    Copyright (C) 2023-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
import {patch} from "@web/core/utils/patch";
import {PosStore} from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    async setup() {
        this.create_new_line = false;
        await super.setup(...arguments);
    },
    async addLineToCurrentOrder(vals, opt = {}, configure = true) {
        var result = await super.addLineToCurrentOrder(vals, opt, configure);
        var order = this.get_order();
        order.create_new_line = false;
        return result;
    },
});
