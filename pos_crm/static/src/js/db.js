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
            var updated_count = this._super(partners);
            if (updated_count > 0) {
                for (var id in this.partner_by_id) {
                    const partner = this.partner_by_id[id];
                    if (partner.vat) {
                        var vat_unmasked = removePunctuation(partner.vat);
                        // Some times the vat id can be repeated...
                        if (this.partner_by_tax_id[vat_unmasked]) {
                            this.partner_by_tax_id[vat_unmasked].push(partner.id);
                        } else {
                            this.partner_by_tax_id[vat_unmasked] = [partner.id];
                        }
                    }
                }
            }
            return updated_count;
        },
        get_partners_by_tax_id: function (tax_id) {
            var result_ids = [];
            const vat_unmasked = removePunctuation(tax_id);
            var partner_ids = this.partner_by_tax_id[vat_unmasked];
            if (partner_ids) {
                partner_ids.forEach((element) => {
                    result_ids.push(this.partner_by_id[element]);
                });
            }
            return result_ids;
        },
    });

    return {
        removePunctuation,
    };
});
