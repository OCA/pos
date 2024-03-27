odoo.define("pos_pricelist_multi_currency.DB", function (require) {
    "use strict";

    const DB = require("point_of_sale.DB");

    DB.include({
        init: function (options) {
            this._super(options);
            this.currency_by_id = {};
        },

        add_currencies: function (currencies) {
            let currs = currencies;
            if (!currencies instanceof Array) {
                currs = [currencies];
            }
            currs.forEach((currency) => {
                this.currency_by_id[currency.id] = currency;
            });
        },
    });
});
