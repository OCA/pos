/** @odoo-module **/

import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";
import {_lt} from "@web/core/l10n/translation";

const {useState} = owl;

class ChooseDeliveryCarrierPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.state = useState({choose: this.props.chooses[0]});
    }
    onChange(carrierId) {
        const selected = this.props.chooses.find(
            (item) => parseInt(carrierId) === item.carrier_id[0]
        );
        this.state.choose = selected;
    }
    getPayload() {
        return this.props.chooses.find((item) => this.state.choose === item);
    }
}

ChooseDeliveryCarrierPopup.template = "ChooseDeliveryCarrierPopup";
ChooseDeliveryCarrierPopup.defaultProps = {
    confirmText: _lt("Confirm"),
    cancelText: _lt("Cancel"),
    title: _lt("Add a shipping method"),
    body: "",
    list: [],
    confirmKey: false,
};

Registries.Component.add(ChooseDeliveryCarrierPopup);

export default ChooseDeliveryCarrierPopup;
