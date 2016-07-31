/******************************************************************************
 *    Point Of Sale - Pricelist for POS Odoo
 *    Copyright (C) 2014 Taktik (http://www.taktik.be)
 *    @author Adil Houmadi <ah@taktik.be>
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
function pos_pricelist_widgets(instance, module) {

    var round_di = instance.web.round_decimals;

    module.OrderWidget = module.OrderWidget.extend({
        set_value: function (val) {
            this._super(val);
            var order = this.pos.get('selectedOrder');
            if (this.editable && order.getSelectedLine()) {
                var mode = this.numpad_state.get('mode');
                if (mode === 'price') {
                    order.getSelectedLine().set_manual_price(true);
                }
            }
        }
    });

    module.OrderButtonWidget = module.OrderButtonWidget.extend({
        selectOrder: function (event) {
            this._super(event);
            var partner = this.order.get_client()
                ? this.order.get_client()
                : false;
            this.pos.pricelist_engine.update_products_ui(partner);
        }
    });

    instance.point_of_sale.ProductListWidget.include({
        init: function (parent, options) {
            this._super(parent, options);
            this.display_price_with_taxes = false;
            if (
                posmodel
                && posmodel.config
                && posmodel.config.display_price_with_taxes
            ) {
                this.display_price_with_taxes
                    = posmodel.config.display_price_with_taxes
            }
        },
        renderElement: function () {
            this._super();
            var order = posmodel.get_order();
            var customer = null;
            if(order) {
                customer = order.get_client();
            }
            this.pos.pricelist_engine.update_products_ui(customer);
        }
    });

    module.PosBaseWidget.include({
        format_pr: function(amount, precision) {
            // Do not call _super because no addon or XML is using this method
            var currency = (this.pos && this.pos.currency) ? this.pos.currency : {symbol:'$', position: 'after', rounding: 0.01, decimals: 2};
            var decimals = currency.decimals;

            if (precision && this.pos.dp[precision] !== undefined) {
                decimals = this.pos.dp[precision];
            }

            if (typeof amount === 'number') {
                amount = round_di(amount,decimals).toFixed(decimals);
                amount = openerp.instances[this.session.name].web.format_value(round_di(amount, decimals), { type: 'float', digits: [69, decimals]});
            }
            return amount
        }
    });
}

