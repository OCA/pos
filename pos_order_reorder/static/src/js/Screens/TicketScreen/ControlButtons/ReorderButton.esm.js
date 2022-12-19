/** @odoo-module **/

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";
import {Orderline} from "point_of_sale.models";

class ReorderButton extends PosComponent {
    get isEmptyOrder() {
        if (!this.props.order) return true;
        return this.props.order.is_empty();
    }
    _reOrder() {
        if (this.isEmptyOrder) {
            return;
        }
        const order = this.props.order;
        const pos = this.env.pos;
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
            const new_line = Orderline.create(
                {},
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
        this.trigger("click-order", newOrder);
    }
    _prepareReorderLineVals(order, line) {
        return {
            pos: this.env.pos,
            order: order,
            product: this.env.pos.db.get_product_by_id(line.get_product().id),
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
Registries.Component.add(ReorderButton);

export default ReorderButton;
