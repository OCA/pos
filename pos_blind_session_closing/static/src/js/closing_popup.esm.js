/**
 *  Copyright 2026 Bernat Obrador APSL-Nagarro
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */

import {ClosePosPopup} from "@point_of_sale/app/navbar/closing_popup/closing_popup";
import {patch} from "@web/core/utils/patch";

patch(ClosePosPopup.prototype, {
    setup() {
        super.setup(...arguments);
        this.canSeeClosingAmounts = this.pos.user.canSeeClosingAmounts;
    },
});
