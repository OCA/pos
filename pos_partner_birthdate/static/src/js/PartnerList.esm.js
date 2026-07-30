/** @odoo-module **/
import {PartnerListScreen} from "@point_of_sale/app/screens/partner_list/partner_list";
import {patch} from "@web/core/utils/patch";
import {parseDate, serializeDate} from "@web/core/l10n/dates";

patch(PartnerListScreen.prototype, {
    async getNewPartners() {
        if (this.state.query) {
            let domain = [];
            const limit = 30;
            let birthdateQuery = false;
            try {
                birthdateQuery = parseDate(this.state.query);
            } catch (error) {
                return super.getNewPartners();
            }
            if (birthdateQuery && birthdateQuery.isValid) {
                const search_fields = [
                    "name",
                    "parent_name",
                    "phone",
                    "mobile",
                    "email",
                    "barcode",
                    "street",
                    "zip",
                    "city",
                    "state_id",
                    "country_id",
                    "vat",
                ];
                domain = [
                    ...Array(search_fields.length).fill("|"),
                    ...search_fields.map((field) => [
                        field,
                        "ilike",
                        this.state.query + "%",
                    ]),
                ];
                birthdateQuery = serializeDate(birthdateQuery);
                domain.push(["birthdate_date", "=", birthdateQuery]);
                // FIXME POSREF timeout
                const result = await this.orm.silent.call(
                    "pos.session",
                    "get_pos_ui_res_partner_by_params",
                    [
                        [odoo.pos_session_id],
                        {domain, limit: limit, offset: this.state.currentOffset},
                    ]
                );
                return result;
            }
        }
        return super.getNewPartners();
    },
});
