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
odoo.define('pos_pricelist.screens', function (require) {
	"use strict";

	var screens = require('point_of_sale.screens');
	var core = require('web.core');

    screens.ClientListScreenWidget = screens.ClientListScreenWidget.extend({
        save_changes: function () {
            this._super();
            if (this.has_client_changed()) {
                var currentOrder = this.pos.get('selectedOrder');
                var orderLines = currentOrder.get('orderLines').models;
                var partner = currentOrder.get_client();
                this.pos.pricelist_engine.update_products_ui(partner);
                this.pos.pricelist_engine.update_ticket(partner, orderLines);
            }
        }
    });

	return screens;

});
