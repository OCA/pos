/** @odoo-module **/

import {onMounted, useState} from "@odoo/owl";
import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";
import {isConnectionError} from "point_of_sale.utils";

class AlreadyPaidLines extends PosComponent {
    setup() {
        super.setup();
        this.paidOrderLines = [];
        this.state = useState({
            showAlreadyPaid: true,
            showAlreadyPaidButton: false,
            showAlreadyPaidOffline: false,
        });
        onMounted(this.onMounted);
    }

    onMounted() {
        this.loadAlreadyPaidOrderLines();
    }

    /* Hide or display already paid lines */
    toggleAlreadyPaid() {
        this.state.showAlreadyPaid = !this.state.showAlreadyPaid;
    }

    async loadAlreadyPaidOrderLines() {
        try {
            this.paidOrderLines = await this.rpc({
                model: "pos.order",
                method: "get_split_order_linked_order_lines",
                args: [this.props.order.uid, this.env.pos.pos_session.id],
            });

            if (this.paidOrderLines.length === 0) {
                this.state.showAlreadyPaidButton = false;
            } else {
                this.state.showAlreadyPaidButton = true;
            }

            this.render();
        } catch (error) {
            if (isConnectionError(error)) {
                this.state.showAlreadyPaidOffline = true;
                return;
            }
            throw error;
        }
    }

    get alreadyPaidOrderLines() {
        return this.paidOrderLines || [];
    }
}

AlreadyPaidLines.template = "AlreadyPaidLines";
Registries.Component.add(AlreadyPaidLines);
export default AlreadyPaidLines;
