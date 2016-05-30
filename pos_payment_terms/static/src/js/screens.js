/******************************************************************************
*    Point Of Sale - Payment Terms for POS Odoo
*    Copyright (C) 2016 KMEE INFORMATICA LTDA (http://www.kmee.com.br)
*    @author Luiz Felipe do Divino <luiz.divino@kmee.com.br>
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

function pos_payment_terms_screens(instance, module) {

    module.PaymentScreenWidget = module.PaymentScreenWidget.extend({
        validate_order: function(options) {
            this._super(options);

            var currentOrder = this.pos.get('selectedOrder');
            currentOrder.attributes.payment_term_id = $(".paymentline-input").val();
        }
     });

 }