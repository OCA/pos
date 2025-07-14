/* @odoo-module */

import PosComponent from "point_of_sale.PosComponent";
import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";
import {useListener} from "@web/core/utils/hooks";

export default class DelegatedMemberButton extends PosComponent {
    setup() {
        super.setup();
        useListener("click", this.onClick);
    }

    async onClick() {
        const selectedOrderline = this.env.pos.get_order().get_selected_orderline();
        if (
            selectedOrderline &&
            !selectedOrderline.refunded_orderline_id &&
            selectedOrderline.get_product().membership
        ) {
            const {confirmed, payload: newPartner} = await this.showTempScreen(
                "PartnerListScreen",
                {partner: selectedOrderline.get_delegated_member()}
            );
            if (confirmed) {
                selectedOrderline.set_delegated_member(newPartner);
            }
        }
    }
}

DelegatedMemberButton.template = "DelegatedMemberButton";

ProductScreen.addControlButton({
    component: DelegatedMemberButton,
    condition: function () {
        const selectedOrderline = this.env.pos.get_order().get_selected_orderline();
        return (
            selectedOrderline &&
            !selectedOrderline.refunded_orderline_id &&
            selectedOrderline.get_product().membership
        );
    },
});

Registries.Component.add(DelegatedMemberButton);
