/**
 * Copyright 2026 Aurestic (https://www.aurestic.es) - Antonio Valdés
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

import {ManageGiftCardPopup} from "@pos_loyalty/utils/manage_giftcard_popup/manage_giftcard_popup";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";
import {serializeDate} from "@web/core/l10n/dates";
import {usePos} from "@point_of_sale/app/store/pos_hook";

const {DateTime} = luxon;

/**
 * The PoS hardcodes "today + 1 year" as the expiration date of the gift
 * cards it generates. When the gift card program defines a fixed duration
 * (duration_days) we use it instead. Without duration we keep the standard
 * behavior.
 *
 * @param {Object} program loyalty.program record
 * @returns {DateTime|null} expiration date, or null if the program has no duration
 */
function getProgramExpirationDate(program) {
    if (program && program.program_type === "gift_card" && program.duration_days > 0) {
        return DateTime.now().plus({days: program.duration_days});
    }
    return null;
}

patch(PosStore.prototype, {
    async _updatePrograms() {
        await super._updatePrograms(...arguments);
        const changes = this.get_order()?.uiState?.couponPointChanges;
        if (!changes) {
            return;
        }
        for (const change of Object.values(changes)) {
            // Manual gift cards already carry the date chosen by the cashier
            if (change.manual || !change.expiration_date) {
                continue;
            }
            const expiration = getProgramExpirationDate(
                this.models["loyalty.program"].get(change.program_id)
            );
            if (expiration) {
                change.expiration_date = serializeDate(expiration);
            }
        }
    },
});

patch(ManageGiftCardPopup.prototype, {
    setup() {
        super.setup(...arguments);
        const pos = usePos();
        // Same program the PoS uses when the gift card is created manually
        const program = pos.models["loyalty.program"].find(
            (p) => p.program_type === "gift_card"
        );
        const expiration = getProgramExpirationDate(program);
        if (expiration) {
            this.state.expirationDate = expiration;
        }
    },
});
