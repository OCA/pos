odoo.define("pos_edit_order_line.EditOrderPopup", function (require) {
    "use strict";

    const {useState} = owl;
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");

    class EditOrderPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this._id = 0;
            this.state = useState({array: this._initialize(this.props.array)});
            this.changes = {};
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
            // If no array is provided, we initialize with one empty item.
            if (array.length === 0) return [this._emptyItem()];
            // Put _id for each item. It will serve as unique identifier of each item.
            return array.map((item) =>
                Object.assign(
                    {},
                    {_id: this._nextId()},
                    typeof item === "object" ? item : {text: item}
                )
            );
        }
        _onchange(event) {
            const {id, changes} = event.detail;
            this.changes[id] = changes;
        }
        getPayload() {
            return this.changes;
        }
        async confirm() {
            var allowConfirmChanges = true;
            _.each(Object.values(this.changes), (updates) =>
                _.each(Object.values(updates), (value) => {
                    if (isNaN(value)) {
                        allowConfirmChanges = false;
                    }
                })
            );

            if (allowConfirmChanges) {
                return super.confirm();
            }
        }
    }
    EditOrderPopup.template = "EditOrderPopup";
    EditOrderPopup.defaultProps = {
        confirmText: _t("Save"),
        cancelText: _t("Cancel"),
        array: [],
    };

    Registries.Component.add(EditOrderPopup);

    return EditOrderPopup;
});
