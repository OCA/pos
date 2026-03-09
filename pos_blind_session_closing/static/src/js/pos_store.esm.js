/**
 *  Copyright 2026 Bernat Obrador APSL-Nagarro
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";
import {user} from "@web/core/user";

patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        this.user.canSeeClosingAmounts = await user.hasGroup(
            "pos_blind_session_closing.group_pos_close_session_amounts"
        );
    },
});
