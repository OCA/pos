import {Component, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {usePos} from "@point_of_sale/app/hooks/pos_hook";
import {EditOrderLineInput} from "./EditOrderLineInput.esm";

export class EditOrderPopup extends Component {
    static template = "EditOrderPopup";
    static components = {Dialog, EditOrderLineInput};

    setup() {
        super.setup();
        this._id = 0;
        this.state = useState({array: this._initialize(this.props.array)});
        this.changes = {};
        this.pos = usePos();
        this.handleChange = this.handleChange.bind(this);
    }
    _nextId() {
        return this._id++;
    }
    _emptyItem() {
        return {
            text: "",
            _id: this._nextId(),
        };
    }
    _initialize(array) {
        if (array.length === 0) return [this._emptyItem()];
        return array.map((item) =>
            Object.assign(
                {},
                {_id: this._nextId()},
                typeof item === "object" ? item : {text: item}
            )
        );
    }
    handleChange({id, changes}) {
        this.changes[id] = changes;
    }

    async confirm() {
        var allowConfirmChanges = true;
        Object.values(this.changes).forEach((updates) => {
            Object.values(updates).forEach((value) => {
                if (isNaN(value)) {
                    allowConfirmChanges = false;
                }
            });
        });
        if (allowConfirmChanges) {
            this.apply_changes(this.changes);
            this.props.close();
        }
    }
    async apply_changes(payload) {
        var order = this.pos.getOrder();
        Object.entries(payload).forEach(([id, changes]) => {
            var line = order.getOrderline(id);
            Object.entries(changes).forEach(([key, value]) => {
                if (key === "quantity") {
                    line.setQuantity(value);
                } else if (key === "price") {
                    line.setUnitPrice(value);
                } else if (key === "discount") {
                    line.setDiscount(value);
                }
            });
        });
    }
}
