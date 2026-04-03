// Copyright 2026 ACSONE SA/NV
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import {PartnerList} from "@point_of_sale/app/screens/partner_list/partner_list";
import {patch} from "@web/core/utils/patch";

patch(PartnerList.prototype, {
    async getNewPartners() {
        // TODO: Should be optimized as this will do a second query as
        // in point_of_sale, search arguments could not be overidden
        let res = await super.getNewPartners();
        let domain = [];
        const limit = 30;
        if (this.state.query) {
            const search_fields = ["ref"];
            domain = [
                ...Array(search_fields.length - 1).fill("|"),
                ...search_fields.map((field) => [
                    field,
                    "ilike",
                    this.state.query + "%",
                ]),
            ];
        }

        const result = await this.pos.data.searchRead("res.partner", domain, [], {
            limit: limit,
            offset: this.state.currentOffset,
        });

        if (res.length > 0 && result.length > 0) {
            res = res.append(result);
        } else if (result.length > 0) {
            return result;
        }
        return res;
    },
});
