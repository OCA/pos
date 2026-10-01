/** @odoo-module **/

import {Component} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class ReorderButton extends Component {
    static template = "ReorderButton";

    setup() {
        this.pos = usePos();
    }
    get isEmptyOrder() {
        if (!this.props.order) return true;
        return this.props.order.is_empty();
    }
    _reOrder() {
        if (this.isEmptyOrder) {
            return;
        }
        const order = this.props.order;
        const pos = this.pos;
        const partner = order.get_partner();
        const newOrder = pos.add_new_order();
        if (partner) {
            newOrder.set_partner(partner);
        }
        if (order.fiscal_position) {
            newOrder.fiscal_position = order.fiscal_position;
        }
        if (order.pricelist) {
            newOrder.set_pricelist(order.pricelist);
        }
        const lines = order.get_orderlines();
        for (var i = 0; i < lines.length; i++) {
            const line = lines[i];
            const new_line = this.props.order.models["pos.order.line"].create(
                this._prepareReorderLineVals(newOrder, line)
            );
            if (line.pack_lot_lines) {
                new_line.setPackLotLines({
                    modifiedPackLotLines: [],
                    newPackLotLines: (line.lot_names || []).map((name) => ({
                        lot_name: name,
                    })),
                });
            }
            new_line.set_unit_price(line.get_unit_price());
            new_line.set_quantity(line.get_quantity());
            new_line.set_discount(line.get_discount());
        }
        this.pos.closeScreen();
    }
    _prepareReorderLineVals(order, line) {
        return {
            order_id: order,
            product_id: line.product_id,
            description: line.name,
            price_unit: line.price_unit,
            tax_ids: line.tax_ids.map((tax) => ["link", tax]),
            price_manually_set: true,
            customer_note: line.customer_note,
        };
    }
    _onClick() {
        this._reOrder();
    }
}
