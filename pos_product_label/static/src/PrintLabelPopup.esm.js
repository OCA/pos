/* @odoo-module */

import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";
const {onWillStart, useState} = owl;

export default class PrintLabelPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.data = useState({
            quantityToPrint: "order",
            quantity: 1,
            format: null,
            extraContent: null,
        });
        onWillStart(async () => {
            const data = await this.rpc({
                model: "product.label.layout",
                method: "fields_get",
                kwargs: {
                    allfields: ["print_format"],
                    attributes: ["selection"],
                },
            });
            this.printFormatOptions = Object.fromEntries(data.print_format.selection);
            this.data.format = data.print_format.selection[0][0];
        });
    }

    updateFormat(event) {
        this.data.format = event.target.value;
    }

    async confirm() {
        const order = this.env.pos.get_order();
        const productIds = [
            ...new Set(order.get_orderlines().map((line) => line.product.id)),
        ];
        const data = {
            product_ids: productIds,
            pos_quantity: this.data.quantityToPrint,
            custom_quantity: this.data.quantity,
            order_quantity_by_product:
                this.data.quantityToPrint === "order"
                    ? Object.fromEntries(
                          order
                              .get_orderlines()
                              .map((line) => [line.product.id, line.quantity])
                      )
                    : undefined,
            print_format: this.data.format,
            extra_html: this.data.extraContent,
        };
        const response = await this.rpc({
            model: "pos.session",
            method: "print_product_labels",
            args: [odoo.pos_session_id, data],
        });
        this.env.legacyActionManager.do_action(response);
        return super.confirm();
    }
}

PrintLabelPopup.template = "PrintLabelPopup";
Registries.Component.add(PrintLabelPopup);
