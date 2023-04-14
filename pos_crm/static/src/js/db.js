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
                        const customerTaxIdUnmasked = removePunctuation(partner.vat);

                        if (this.partner_by_tax_id[customerTaxIdUnmasked]) {
                            this.partner_by_tax_id[customerTaxIdUnmasked].push(
                                partner.id
                            );
                        } else {
                            this.partner_by_tax_id[customerTaxIdUnmasked] = [
                                partner.id,
                            ];
                        }
                    }
                });
            }

            return updatedCount;
        },
        get_partners_by_tax_id: function (taxId) {
            const resultIds = [];
            const customerTaxIdUnmasked = removePunctuation(taxId);
            const partner = this.partner_by_tax_id[customerTaxIdUnmasked];
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
