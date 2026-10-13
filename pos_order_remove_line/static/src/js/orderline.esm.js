/*
 *  Copyright 2023 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {Orderline} from "@point_of_sale/app/components/orderline/orderline";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(Orderline.prototype, {
    setup() {
        super.setup(...arguments);
        this.dialog = useService("dialog");
        this.pos = useService("pos");
    },
    get isDisplayButtonRemove() {
        return this.pos.config.pos_line_remove_btn && this.props.mode === "display";
    },
    _executeRemove() {
        const currentOrder = this.pos.get_order();
        if (currentOrder && this.props.line) {
            currentOrder.removeOrderline(this.props.line);
        }
    },
    removeLine(event) {
        event.stopPropagation();
        event.preventDefault();

        const showWarning = this.pos.config.pos_line_remove_warning;
        if (showWarning) {
            this.dialog.add(ConfirmationDialog, {
                body: _t("Are you sure that you want to remove this item?"),
                confirm: () => this._executeRemove(),
                confirmLabel: _t("Remove"),
            });
        } else {
            this._executeRemove();
        }
    },
});
