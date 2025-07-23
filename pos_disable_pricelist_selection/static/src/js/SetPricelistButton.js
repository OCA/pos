/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { SetPricelistButton } from "@point_of_sale/app/screens/product_screen/control_buttons/pricelist_button/pricelist_button";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

patch(SetPricelistButton.prototype, {
    setup() {
        super.setup();
        this.popup = useService("popup");
    },

    getPricelistList() {
        const selectablePricelists = this.pos.selectable_pricelists || [];
        const selectionList = selectablePricelists.map((pricelist) => ({
            id: pricelist.id,
            label: pricelist.name,
            isSelected: this.currentOrder.pricelist && pricelist.id === this.currentOrder.pricelist.id,
            item: pricelist,
        }));

        if (!this.pos.default_pricelist || !this.pos.config.use_pricelist) {
            selectionList.push({
                id: null,
                label: _t("Default Price"),
                isSelected: !this.currentOrder.pricelist,
                item: null,
            });
        }
        return selectionList;
    },

    async click() {
        if (this.pos.config.hide_pricelist_button) {
            return;
        }
        await super.click();
    },
});
