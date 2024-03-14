odoo.define("pos_restricted_customer_list.PartnerDetailsEdit", function (require) {
    "use strict";

    const {useState} = owl;
    const PartnerDetailsEdit = require("point_of_sale.PartnerDetailsEdit");
    const Registries = require("point_of_sale.Registries");

    const PosPartnerDetailsEdit = (OriginalPartnerDetailsEdit) =>
        class extends OriginalPartnerDetailsEdit {
            setup() {
                super.setup();

                const partnerCategory = this.env.pos.config.partner_category_id;
                this.defaultCategoryId = partnerCategory ? partnerCategory[0] : false;

                this.changes = useState({
                    ...this.changes,
                    category_id: this.props.partner.category_id || [],
                });
            }

            saveChanges() {
                if (this.defaultCategoryId) {
                    this.changes.category_id = [[4, this.defaultCategoryId]];
                }
                return super.saveChanges();
            }
        };

    Registries.Component.extend(PartnerDetailsEdit, PosPartnerDetailsEdit);

    return PartnerDetailsEdit;
});
