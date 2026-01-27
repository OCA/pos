odoo.define("pos_picking_load.PickingLoadRow", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PickingLoadRow extends PosComponent {
        get order() {
            return this.props.order;
        }
        get highlighted() {
            const highlightedOrder = this.props.highlightedOrder;
            return !highlightedOrder
                ? false
                : highlightedOrder.backendId === this.props.order.backendId;
        }
        get isHighlighted() {
            if (
                this.props.highlightedOrder &&
                this.props.highlightedOrder.id === this.props.order.id
            ) {
                return this.props.highlightedOrder.id;
            }
        }

        get name() {
            return this.order.name;
        }
        get scheduled_date() {
            return moment(this.order.scheduled_date).format("YYYY-MM-DD hh:mm A");
        }
        get customer() {
            const partner = this.order.partner_id;
            return partner ? partner[1] : null;
        }
        get origin() {
            return this.order.origin;
        }
    }
    PickingLoadRow.template = "PickingLoadRow";

    Registries.Component.add(PickingLoadRow);

    return PickingLoadRow;
});
