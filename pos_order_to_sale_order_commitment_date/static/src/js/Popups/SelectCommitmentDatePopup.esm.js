/** @odoo-module **/

import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";
import {_lt} from "@web/core/l10n/translation";

const {useState} = owl;

class SelectCommitmentDatePopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.state = useState({datetime: this.props.datetime});
    }

    updateDatetime(ev) {
        this.state.datetime = ev.target.value;
    }

    getPayload() {
        return this.state.datetime;
    }
}

SelectCommitmentDatePopup.template = "SelectCommitmentDatePopup";
SelectCommitmentDatePopup.defaultProps = {
    confirmText: _lt("Confirm"),
    cancelText: _lt("Cancel"),
    confirmKey: false,
};

Registries.Component.add(SelectCommitmentDatePopup);

export default SelectCommitmentDatePopup;
