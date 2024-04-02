/** @odoo-module alias=pos_partner_location_abstract.PartnerMapEdit **/

import AbstractAwaitablePopup from "point_of_sale.AbstractAwaitablePopup";
import Registries from "point_of_sale.Registries";
import {useRef} from "@odoo/owl";

class PartnerMapEdit extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.partner = this.props.partner;
        this.lat = parseFloat(this.partner.partner_latitude) || 0;
        this.lng = parseFloat(this.partner.partner_longitude) || 0;
        this.address = {};
        this.mapContainerRef = useRef("map-container");
        this.addrInput = useRef("addr-input");
        this.config = this.env.pos.config;
        this.provider = "";
        this.onHandleMap();
    }

    onHandleMap() {}

    async getPayload() {
        return {
            partner_latitude: this.lat,
            partner_longitude: this.lng,
            ...this.address,
        };
    }

    updateMarker(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }

    /* eslint no-empty-function: "warn"*/
    /* eslint no-unused-vars: "warn"*/
    setAddressByLocation(addres) {}

    inputChange(event) {
        this.setAddressByLocation(event.target.value);
    }
}
PartnerMapEdit.template = "PartnerMapEdit";

Registries.Component.add(PartnerMapEdit);

export default PartnerMapEdit;
