/*
 *  Copyright 2023 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

patch(Orderline.prototype, {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        this.numberBuffer = useService("number_buffer");
        this.pos = usePos();
    },
    get isDisplayButtonRemove() {
        return this.pos.config.pos_line_remove_btn;
    },
    _executeRemove() {
        this.numberBuffer.sendKey("Backspace");
        this.numberBuffer.sendKey("Backspace");
    },
    removeLine(event) {
        if (this.props.class.selected) {
            event.stopPropagation();
            event.preventDefault();
        }
        const showWarning = this.pos.config.pos_line_remove_warning;
        if (showWarning) {
            this.dialog.add(ConfirmationDialog, {
                body: _t("Are you sure that you want to remove this item?"),
                confirm: () => this._executeRemove(),
                confirmLabel: _t("Remove"),
                // eslint-disable-next-line no-empty-function
                cancel: () => {},
            });
        } else {
            this._executeRemove();
        }
    },
});
