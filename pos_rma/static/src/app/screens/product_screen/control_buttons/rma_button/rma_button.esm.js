/** @odoo-module */

/* Copyright 2025 (APSL-Nagarro) - Antoni Marroig
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import {Component} from "@odoo/owl";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";
import {ConfirmPopup} from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import {RMAPopup} from "@pos_rma/app/store/rma_popup/rma_popup.esm";
import {_t} from "@web/core/l10n/translation";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class RMAButton extends Component {
    static template = "pos_rma.RMAButton";
    setup() {
        this.pos = usePos();
        this.popup = useService("popup");
    }
    async check_can_create_rma() {
        return await this.pos.orm.call("rma", "check_can_create_rma", [
            this.props.line,
        ]);
    }
    async click() {
        if (!this.props.line || !this.props.order) {
            return;
        }
        if (!this.props.order.partner) {
            const order = this.props.order;
            const {confirmed: confirmedPopup} = await this.popup.add(ConfirmPopup, {
                title: _t("Need customer to create RMA"),
                body: _t("Do you want to open the customer list to select customer?"),
            });
            if (!confirmedPopup) {
                return;
            }
            const {confirmed: confirmedTempScreen, payload: newPartner} =
                await this.pos.showTempScreen("PartnerListScreen");
            if (!confirmedTempScreen) {
                return;
            }

            await this.pos.orm.write("pos.order", [order.backendId], {
                partner_id: newPartner.id,
            });
            order.set_partner(newPartner);
        }
        if (!(await this.check_can_create_rma(this.props.line))) {
            return this.popup.add(ErrorPopup, {
                title: _t("Validation Error"),
                body: _t("Cannot create RMA for this product"),
            });
        }
        const line = this.props.order.get_orderline(this.props.line);
        await this.popup.add(RMAPopup, {
            maxqty: line.quantity,
            order: this.props.order,
            line: line,
        });
    }
}
