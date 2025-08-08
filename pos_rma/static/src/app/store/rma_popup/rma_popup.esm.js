/** @odoo-module **/

/* Copyright 2025 (APSL-Nagarro) - Antoni Marroig
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {NumericInput} from "@point_of_sale/app/generic_components/inputs/numeric_input/numeric_input";
import {_t} from "@web/core/l10n/translation";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";
import {useState} from "@odoo/owl";

export class RMAPopup extends AbstractAwaitablePopup {
    static template = "pos_rma.RMAPopup";
    static components = {NumericInput};
    static defaultProps = {cancelKey: false};

    setup() {
        super.setup();
        this.pos = usePos();
        this.validQty = false;
        this.state = useState({
            note: "",
            qty: this.env.utils.formatCurrency(1, false),
        });
        this.maxqty = this.props.maxqty;
        this.popup = useService("popup");
        this.orm = useService("orm");
        this.notification = useService("notification");
    }

    async confirm() {
        const quantity = Math.round(parseInt(this.state.qty));
        if (quantity <= 0 || quantity > this.maxqty) {
            return this.popup.add(ErrorPopup, {
                title: _t("User Error"),
                body: _t("Quantity must be less than or equal of " + this.maxqty),
            });
        } else if (!this.state.note) {
            return this.popup.add(ErrorPopup, {
                title: _t("User Error"),
                body: _t("You must add a note to the RMA"),
            });
        }
        await this.pos.orm.call("rma", "create_rma_from_pos", [
            this.props.line.id,
            this.state.qty,
            this.state.note,
        ]);
        this.notification.add(
            _t("The RMA has been created and processed successfully."),
            {
                title: _t("Success 🎉"),
                type: "success",
                sticky: false,
            }
        );
        this.props.close();
    }
}
