/** @odoo-module **/

import CreateOrderPopup from "point_of_sale.CreateOrderPopup";
import Registries from "point_of_sale.Registries";
import {_lt} from "@web/core/l10n/translation";

const {useState} = owl;

const PosCommitmentDateCreateOrderPopup = (OriginalCreateOrderPopup) =>
    class extends OriginalCreateOrderPopup {
        setup() {
            super.setup();
            this.state = useState({addCommitmentDate: false});
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }
        onClickToAddCommitmentDate() {
            this.state.addCommitmentDate = !this.state.addCommitmentDate;
        }
        async _actionCreateSaleOrder(order_state) {
            const addCommitmentDate = this.state.addCommitmentDate;
            if (addCommitmentDate) {
                const {confirmed, payload} = await this.showPopup(
                    "SelectCommitmentDatePopup",
                    {
                        title: _lt("Add a Commitment Date"),
                        body: _lt("Please select a commitment date for the order."),
                    }
                );

                if (confirmed) {
                    this.currentOrder.set_commitment_date(payload);
                }
            }
            return await super._actionCreateSaleOrder(order_state);
        }
    };

Registries.Component.extend(CreateOrderPopup, PosCommitmentDateCreateOrderPopup);
