/** @odoo-module **/

import {Orderline} from "@point_of_sale/app/store/models";
import {Component} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class ReorderButton extends Component {
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
            const new_line = new Orderline(
                {env: this.env},
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
            newOrder.add_orderline(new_line);
        }
        this.pos.closeScreen();
    }
    _prepareReorderLineVals(order, line) {
        return {
            pos: this.pos,
            order: order,
            product: this.pos.db.get_product_by_id(line.get_product().id),
            description: line.name,
            price: line.price_unit,
            tax_ids: order.fiscal_position ? undefined : line.tax_id,
            price_manually_set: true,
            customer_note: line.customer_note,
        };
    }
    _onClick() {
        this._reOrder();
    }
}
ReorderButton.template = "ReorderButton";
