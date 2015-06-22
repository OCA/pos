/**
 * # -*- coding: utf-8 -*-
 * ##############################################################################
 * #
 * #    OpenERP, Open Source Management Solution
 * #    This module copyright :
 * #        (c) 2014 Antiun Ingenieria, SL (Madrid, Spain, http://www.antiun.com)
 * #                 Antonio Espinosa <antonioea@antiun.com>
 * #                 Endika Iglesias <endikaig@antiun.com>
 * #
 * #    This program is free software: you can redistribute it and/or modify
 * #    it under the terms of the GNU Affero General Public License as
 * #    published by the Free Software Foundation, either version 3 of the
 * #    License, or (at your option) any later version.
 * #
 * #    This program is distributed in the hope that it will be useful,
 * #    but WITHOUT ANY WARRANTY; without even the implied warranty of
 * #    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * #    GNU Affero General Public License for more details.
 * #
 * #    You should have received a copy of the GNU Affero General Public License
 * #    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #
 * ##############################################################################
 */

// Check jQuery available
if (typeof jQuery === 'undefined') { throw new Error('POS with tax Addon requires jQuery') }

+function ($) {
    'use strict';

    openerp.pos_with_tax = function (instance) {
        var _t = instance.web._t,
            _lt = instance.web._lt;
        var QWeb = instance.web.qweb;

        var round_pr = instance.web.round_precision;

        instance.point_of_sale.ProductListWidget.include({
            compute_all: function(taxes, price_unit) {
                var self = this;
                var res = [];
                var tmp = 0;
                var data = {};
                var currency_rounding = this.pos.currency.rounding;
                if (this.pos.company.tax_calculation_rounding_method == "round_globally"){
                   currency_rounding = currency_rounding * 0.00001;
                }
                var base = price_unit;
                _(taxes).each(function(tax) {
                    if (tax.price_include) {
                        if (tax.type === "percent") {
                            tmp =  round_pr(base - round_pr(base / (1 + tax.amount),currency_rounding),currency_rounding);
                            data = {amount:tmp, price_include:true, id: tax.id};
                            res.push(data);
                        } else if (tax.type === "fixed") {
                            tmp = round_pr(tax.amount * self.get_quantity(),currency_rounding);
                            data = {amount:tmp, price_include:true, id: tax.id};
                            res.push(data);
                        } else {
                            throw "This type of tax is not supported by the point of sale: " + tax.type;
                        }
                    } else {
                        if (tax.type === "percent") {
                            tmp = round_pr(tax.amount * base, currency_rounding);
                            data = {amount:tmp, price_include:false, id: tax.id};
                            res.push(data);
                        } else if (tax.type === "fixed") {
                            tmp = round_pr(tax.amount * self.get_quantity(), currency_rounding);
                            data = {amount:tmp, price_include:false, id: tax.id};
                            res.push(data);
                        } else {
                            throw "This type of tax is not supported by the point of sale: " + tax.type;
                        }

                        var base_amount = data.amount;
                        var child_amount = 0.0;
                        if (tax.child_depend) {
                            res.pop(); // do not use parent tax
                            child_tax = self.compute_all(tax.child_taxes, base_amount);
                            res.push(child_tax);
                            _(child_tax).each(function(child) {
                                child_amount += child.amount;
                            });
                        }
                        if (tax.include_base_amount) {
                            base += base_amount + child_amount;
                        }
                    }
                });
                return res;
            },
            get_product_price_without_tax: function(product){
                return this.get_product_all_prices(product).priceWithoutTax;
            },
            get_product_price_with_tax: function(product){
                return this.get_product_all_prices(product).priceWithTax;
            },
            get_product_all_prices: function(product){
                var base = round_pr(product.price, this.pos.currency.rounding);
                var totalTax = base;
                var totalNoTax = base;
                var taxtotal = 0;
                var taxdetail = {};

                var taxes_ids = product.taxes_id;
                var taxes =  this.pos.taxes;
                var product_taxes = [];

                _(taxes_ids).each(function(el){
                    product_taxes.push(_.detect(taxes, function(t){
                        return t.id === el;
                    }));
                });

                var all_taxes = _(this.compute_all(product_taxes, base)).flatten();

                _(all_taxes).each(function(tax) {
                    if (tax.price_include) {
                        totalNoTax -= tax.amount;
                    } else {
                        totalTax += tax.amount;
                    }
                    taxtotal += tax.amount;
                    taxdetail[tax.id] = tax.amount;
                });

                return {
                    "priceWithTax": totalTax,
                    "priceWithoutTax": totalNoTax,
                    "tax": taxtotal,
                    "taxDetails": taxdetail,
                };
            },
        });

        instance.point_of_sale.Orderline = instance.point_of_sale.Orderline.extend({
            // Show order line prices with taxes included
            get_display_price: function(){
                return this.get_price_with_tax();
            },
        });

    };


}(jQuery);
