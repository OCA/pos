/** @odoo-module */

import {useState} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {EditOrderLineInput} from "./EditOrderLineInput.esm";
import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {_t} from "@web/core/l10n/translation";

export class EditOrderPopup extends AbstractAwaitablePopup {
    static template = "EditOrderPopup";
    static defaultProps = {
        confirmText: _t("Save"),
        cancelText: _t("Cancel"),
        array: [],
    };
    static components = {EditOrderLineInput};
    setup() {
        super.setup();
        this.pos = usePos();
        this._id = 0;
        this.state = useState({array: this._initialize(this.props.array)});
        this.changes = {};
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
    handleChange({id, changes}) {
        this.changes[id] = changes;
    }
    getPayload() {
        return this.changes;
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
            this.props.close({confirmed: true, payload: await this.getPayload()});
        }
    }
}
