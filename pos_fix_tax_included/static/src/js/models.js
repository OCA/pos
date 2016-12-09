/******************************************************************************
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ******************************************************************************/
function pos_fix_tax_included_models(instance, module) {

    var _t = instance.web._t;
    var round_pr = instance.web.round_precision;
    var round_di = instance.web.round_decimals;

    /**
     * Extend the Order line
     */
    var OrderlineParent = module.Orderline;
    module.Orderline = module.Orderline.extend({
        /**
         * @param attr
         * @param options
         */
        initialize: function (attr, options) {
            OrderlineParent.prototype.initialize.apply(this, arguments);
            if (this.product !== undefined) {
                var qty = this.compute_qty(this.order, this.product);
                var partner = this.order ? this.order.get_client() : null;
                var product = this.product;
                var db = this.pos.db;
                var price = this.compute_price_all_incl(
                    db, product, partner, qty
                );
                if (price !== false) {
                    this.price = round_di(parseFloat(price) || 0, this.pos.dp['Product Price']);
                }
                
            }
        },
        compute_price_all_incl: function (db, product, partner, qty) {
            var price = this.pos.pricelist_engine.compute_price_all(
                    db, product, partner, qty
                );
            var total = 0.0;
            var line_search;
            var line_taxes = this.get_applicable_taxes_for_orderline();
            
            var tax_id;
            var tax;
            var taxes = []; //incl_tax
            
            for (var i = 0; i < product.taxes_id.length; i++) {
                tax_id = product.taxes_id[i];
                tax = this.pos.taxes_by_id[tax_id];
                line_search = line_taxes.filter(function( obj ) {
                    return obj.id == tax_id;
                });
                if (tax.price_include === true && line_search.length==0){
                    taxes.push(tax);
                }
            }
            if (taxes.length==0){
                return price;
            }
            
            var amount = 0.0;
            var tax_parent_tot = 0.0;
            var cur_price_unit = price;
            
            for (var i = 0; i < taxes.length; i++) {
                tax = taxes[i];
                if (tax.type=='percent' && !tax.include_base_amount) {
                    tax_parent_tot += tax.amount;
                }
            }
            for (var i = 0; i < taxes.length; i++) {
                tax = taxes[i];
                if (tax.type=='fixed' && !tax.include_base_amount) {
                    cur_price_unit -= tax.amount;
                }
            }
            
            for (var i = 0; i < product.taxes_id.length; i++) {
                tax = taxes[i];
                if (tax.type=='percent') {
                    if (tax.include_base_amount==true) {
                        amount = cur_price_unit - (cur_price_unit / (1 + tax.amount))
                    } else {
                        amount = (cur_price_unit / (1 + tax_parent_tot)) * tax.amount
                    }
                } else if (tax.type=='fixed') {
                    amount = tax.amount
                } else {
                    //TODO
                    console.log('Tax type not done');
                }
                
                if (tax.include_base_amount) {
                    cur_price_unit -= amount
                } else {
                    total += amount
                }
            }
            res = price-1.0*total;
            return res;
        },
    });

}
