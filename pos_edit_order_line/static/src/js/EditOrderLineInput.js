odoo.define("pos_edit_order_line.EditOrderLineInput", function (require) {
    "use strict";

    const {useState} = owl;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class EditOrderLineInput extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({
                quantityInput: this.props.item.quantity,
                priceInput: this.props.item.price,
                discountInput: this.props.item.discount,
            });
            this.changes = {};
        }
        onBlur(event) {
            const id = this.props.item.id;
            const value = parseFloat(event.target.value.trim());
            if (isNaN(value)) {
                $(event.target).addClass("required");
            } else {
                $(event.target).removeClass("required");
            }
            if (this.props.item[event.target.name] != value) {
                this.changes[event.target.name] = value;
                this.trigger("onchange", {id, changes: this.changes});
            }
        }
        onFocus(event) {
            $(event.target).select();
        }
    }
    EditOrderLineInput.template = "EditOrderLineInput";

    Registries.Component.add(EditOrderLineInput);

    return EditOrderLineInput;
});
