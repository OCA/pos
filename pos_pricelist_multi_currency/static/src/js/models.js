odoo.define("pos_pricelist_multi_currency.models", function (require) {
    "use strict";
    const models = require("point_of_sale.models");
    var utils = require("web.utils");
    var round_di = utils.round_decimals;

    const posmodel_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        convert_currency: function (from_currency, to_currency, amount) {
            if (from_currency === to_currency) {
                return amount;
            }
            const from_rate = parseFloat(from_currency.rate);
            const to_rate = parseFloat(to_currency.rate);
            if (from_rate > 0.0 && to_rate > 0.0) {
                return (parseFloat(amount) * to_rate) / from_rate;
            }
            return amount;
        },

        format_currency: function (amount, precision) {
            const cur = this.env.pos.pricelists.filter(
                (pl) => pl.id == this.env.pos.get_order().pricelist.id
            )[0].currency_id;
            this.currency = this.env.pos.db.currency_by_id[cur[0]];
            return posmodel_super.format_currency.call(this, amount, precision);
        },

        /**
         * @override
         * Overwritten to get the correct currency
         */
        c_format_currency: function (amount, precision) {
            // Const to_currency = this.env.pos.db.currency_by_id[
            //     this.env.pos.get_order().pricelist.currency_id[0]
            // ];
            const cur = this.env.pos.pricelists.filter(
                (pl) => pl.id == this.env.pos.get_order().pricelist.id
            )[0].currency_id;
            const to_currency = this.env.pos.db.currency_by_id[cur[0]];
            const from_currency = this.env.pos.db.currency_by_id[
                this.env.pos.config.currency_id[0]
            ];

            let amt = this.convert_currency(from_currency, to_currency, amount);
            amt = this.format_currency_no_symbol(amt, precision);

            if (to_currency.position === "after") {
                return amt + " " + (to_currency.symbol || "");
            }
            return (to_currency.symbol || "") + " " + amt;
        },

        /**
         * @override
         */
        c_format_currency_no_symbol: function (amount, precision, currency) {
            let curr = currency;
            if (!currency) {
                curr = this.env.pos.db.currency_by_id[
                    this.env.pos.get_order().pricelist.currency_id[0]
                ];
            }
            return posmodel_super.format_currency_no_symbol.call(
                this,
                amount,
                precision,
                curr
            );
        },
    });

    const order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        _export_convert_currency: function (res) {
            const self = this;
            const order = self.pos.get_order();
            if (!order || !res.total_with_tax) {
                return res;
            }
            const from_currency =
                self.pos.db.currency_by_id[self.pos.config.currency_id[0]];
            const to_currency =
                self.pos.db.currency_by_id[order.pricelist.currency_id[0]];
            if (from_currency === to_currency) {
                return res;
            }

            if (res.tax_details && res.tax_details.length > 0) {
                _.each(res.tax_details, function (each_tax) {
                    each_tax.amount = self.pos
                        .convert_currency(from_currency, to_currency, each_tax.amount)
                        .toFixed(to_currency.decimals);
                });
            }
            return res;
        },

        export_as_JSON: function () {
            let res = order_super.export_as_JSON.apply(this, arguments);
            res = this._export_convert_currency(res);
            const order = this.pos.get_order();
            if (order) {
                res.currency_id = this.pos.get_order().pricelist.currency_id[0];
            }
            return res;
        },

        export_for_printing: function () {
            let res = order_super.export_for_printing.apply(this, arguments);
            res = this._export_convert_currency(res);
            return res;
        },
    });

    const orderline_super = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        // TODO: move more logic to single abstract method?
        get_unit_price: function () {
            var digits = this.pos.dp["Product Price"];
            // Round and truncate to mimic _symbol_set behavior
            // return parseFloat(round_di(this.price || 0, digits).toFixed(digits));
            const from_currency = this.pos.db.currency_by_id[
                this.pos.config.currency_id[0]
            ];
            const to_currency = this.pos.db.currency_by_id[
                this.order.pricelist.currency_id[0]
            ];
            if (from_currency === to_currency) {
                return this.price;
            }
            const price = this.pos.convert_currency(
                from_currency,
                to_currency,
                this.price
            );
            return parseFloat(round_di(price || 0, digits).toFixed(digits));
        },

        _export_convert_currency: function (res) {
            const order = this.pos.get_order();
            if (!order) {
                return res;
            }
            this.currency_id = order.currency_id;
            const from_currency = this.pos.db.currency_by_id[
                this.pos.config.currency_id[0]
            ];
            const to_currency = this.pos.db.currency_by_id[
                order.pricelist.currency_id[0]
            ];
            if (from_currency === to_currency) {
                return res;
            }
            const amount = this.pos.convert_currency(
                from_currency,
                to_currency,
                this.get_unit_price()
            );
            res.price_display_one = amount;
            res.price_display = this.get_quantity() * amount;
            // TODO: better to convert unit price and multiply by amount
            // or convert the total amount directly?
            return res;
        },

        export_as_JSON: function () {
            let res = orderline_super.export_as_JSON.apply(this, arguments);
            res = this._export_convert_currency(res);
            const order = this.pos.get_order();
            if (order) {
                res.currency_id = this.pos.get_order().pricelist.currency_id[0];
            }
            return res;
        },

        export_for_printing: function () {
            let res = orderline_super.export_for_printing.apply(this, arguments);
            res = this._export_convert_currency(res);
            return res;
        },
    });

    const paymentline_super = models.Paymentline.prototype;
    models.Paymentline = models.Paymentline.extend({
        _export_convert_currency: function (res) {
            const from_currency = this.pos.db.currency_by_id[
                this.pos.config.currency_id[0]
            ];
            const to_currency = this.pos.db.currency_by_id[
                this.order.pricelist.currency_id[0]
            ];
            if (from_currency === to_currency) {
                return res;
            }
            res.amount = this.pos.convert_currency(
                from_currency,
                to_currency,
                res.amount
            );
            return res;
        },

        export_as_JSON: function () {
            let res = paymentline_super.export_as_JSON.apply(this, arguments);
            res = this._export_convert_currency(res);
            const order = this.pos.get_order();
            if (order) {
                res.currency_id = this.pos.get_order().pricelist.currency_id[0];
            }
            return res;
        },

        export_for_printing: function () {
            let res = paymentline_super.export_for_printing.apply(this, arguments);
            res = this._export_convert_currency(res);
            return res;
        },
    });

    models.load_models({
        model: "res.currency",
        fields: ["name", "symbol", "rate", "rounding", "position"],
        loaded: function (self, currencies) {
            self.currency = currencies[0];
            self.company_currency = self.company.currency_id[0];
            currencies.forEach((currency) => {
                if (currency.rounding > 0 && currency.rounding < 1) {
                    currency.decimals = Math.ceil(
                        Math.log(1.0 / currency.rounding) / Math.log(10)
                    );
                } else {
                    currency.decimals = 0;
                }
            });

            self.db.add_currencies(currencies);
        },
    });
    models.load_fields("product.pricelist", ["currency_id"]);
});
