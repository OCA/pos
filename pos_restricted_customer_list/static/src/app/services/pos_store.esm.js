import {PosStore} from "@point_of_sale/app/services/pos_store";
import {patch} from "@web/core/utils/patch";

patch(PosStore.prototype, {
    editPartnerContext() {
        const context = super.editPartnerContext(...arguments);
        context.default_available_in_pos = true;
        const categoryId = this.config.raw.partner_category_id;
        if (this.config.pos_partner_category && categoryId) {
            context.default_category_id = [categoryId];
        }
        return context;
    },
});
