odoo.define("pos_crm.db", function (require) {
    "use strict";

    var PosDB = require("point_of_sale.DB");

    function removePunctuation(string) {
        return string.replace(/[^\w\s]/gi, "");
    }

    PosDB.include({
        init: function (options) {
            this.partner_by_tax_id = {};
            this._super(options);
        },
        add_partners: function (partners) {
            const updatedCount = this._super(partners);
            if (updatedCount > 0) {
                Object.values(this.partner_by_id).forEach((partner) => {
                    if (partner.vat) {
                        const vatUnmasked = removePunctuation(partner.vat);

                        if (this.partner_by_tax_id[vatUnmasked]) {
                            this.partner_by_tax_id[vatUnmasked].push(partner.id);
                        } else {
                            this.partner_by_tax_id[vatUnmasked] = [partner.id];
                        }
                    }
                });
            }

            return updatedCount;
        },
        get_partners_by_tax_id: function (taxId) {
            const resultIds = [];
            const vatUnmasked = removePunctuation(taxId);
            const partner = this.partner_by_tax_id[vatUnmasked];
            if (partner) {
                resultIds.push(...partner);
            }
            return resultIds;
        },
    });

    return {
        removePunctuation,
    };
});
