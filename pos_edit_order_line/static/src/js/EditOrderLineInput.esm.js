/** @odoo-module */

import {Component, useState} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class EditOrderLineInput extends Component {
    static template = "EditOrderLineInput";
    setup() {
        super.setup();
        this.pos = usePos();
        this.state = useState({
            quantityInput: this.props.item.quantity,
            priceInput: this.props.item.price,
            discountInput: this.props.item.discount,
        });
        this.changes = {
            quantityInput: this.props.item.quantity,
            priceInput: this.props.item.price,
            discountInput: this.props.item.discount,
        };
    }
    onChange(event) {
        const id = this.props.item.id;
        const value = parseFloat(event.target.value.trim());
        const targetElement = event.target;
        if (isNaN(value)) {
            targetElement.classList.add("required");
        } else {
            targetElement.classList.remove("required");
        }
        if (this.props.item[targetElement.name] !== value) {
            this.changes[targetElement.name] = value;
            if (this.props.onchange) {
                this.props.onchange({id, changes: this.changes});
            }
        }
    }
    onFocus(event) {
        // Select the text inside the input element
        event.target.select();
    }
}
