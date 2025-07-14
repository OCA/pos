/** @odoo-module **/

import {Orderline} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const DelegatedPartnerOrderline = (OriginalOrderline) =>
    class extends OriginalOrderline {
        constructor(obj, options) {
            super(obj, options);
            this.delegated_member = this.delegated_member || null;
        }

        export_as_JSON() {
            const json = super.export_as_JSON(...arguments);
            json.delegated_member_id = this.get_delegated_member()
                ? this.get_delegated_member().id
                : false;
            return json;
        }

        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            let delegatedMember = null;
            if (json.delegated_member_id) {
                delegatedMember = this.pos.db.get_partner_by_id(
                    json.delegated_member_id
                );
                if (!delegatedMember) {
                    console.error(
                        "ERROR: trying to load a partner not available in the pos"
                    );
                }
            }
            this.delegated_member = delegatedMember;
        }

        get_delegated_member() {
            return this.delegated_member;
        }

        set_delegated_member(partner) {
            this.order.assert_editable();
            this.delegated_member = partner;
        }

        get partner_for_membership() {
            return this.delegated_member || this.order.get_partner();
        }
    };

Registries.Model.extend(Orderline, DelegatedPartnerOrderline);
