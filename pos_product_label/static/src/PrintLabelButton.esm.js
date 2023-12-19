/* @odoo-module */

import PosComponent from "point_of_sale.PosComponent";
import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";
import {useListener} from "@web/core/utils/hooks";

export default class PrintLabelButton extends PosComponent {
    setup() {
        super.setup();
        useListener("click", this.onClick);
    }
    async onClick() {
        await this.showPopup("PrintLabelPopup");
    }
}

PrintLabelButton.template = "PrintLabelButton";

ProductScreen.addControlButton({
    component: PrintLabelButton,
    condition: function () {
        return this.env.pos.config.iface_product_label;
    },
    position: ["after", "SetFiscalPositionButton"],
});

Registries.Component.add(PrintLabelButton);
