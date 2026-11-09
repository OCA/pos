// Copyright 2026 INVITU (https://www.invitu.com)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {TicketScreen} from "@point_of_sale/app/screens/ticket_screen/ticket_screen";
import {patch} from "@web/core/utils/patch";
import {useTrackedAsync} from "@point_of_sale/app/utils/hooks";

patch(TicketScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.doReprintKitchen = useTrackedAsync((order) =>
            this.pos.reprintKitchenReceipt(order)
        );
    },
});
