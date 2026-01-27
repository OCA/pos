odoo.define("pos_picking_load.PickingLoadList", function (require) {
    "use strict";
    /* eslint-disable no-undef */
    const {useListener} = require("@web/core/utils/hooks");
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    const {useState} = owl;

    class PickingLoadList extends PosComponent {
        setup() {
            super.setup();
            useListener("click-order", this._onClickOrder);
            this.state = useState({
                highlightedOrder: this.props.initHighlightedOrder || null,
            });
        }

        get highlightedOrder() {
            return this.props.initHighlightedOrder;
        }

        _onClickOrder({detail: order}) {
            this.state.pos_picking_load = order;
            this.state.highlightedOrder = order;
        }
    }

    PickingLoadList.template = "PickingLoadList";

    Registries.Component.add(PickingLoadList);

    return PickingLoadList;
});
