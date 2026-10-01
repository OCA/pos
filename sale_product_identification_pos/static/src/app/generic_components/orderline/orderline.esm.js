import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";

Object.assign(Orderline.props.line.shape, {
    required_identification: {type: Boolean, optional: true},
    required_message_identification: {type: String, optional: true},
});
