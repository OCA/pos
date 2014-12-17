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
openerp.pos_pricelist = function (instance) {
    var module = instance.point_of_sale;
    pos_pricelist_db(instance, module);
    pos_pricelist_models(instance, module);
    pos_pricelist_screens(instance, module);
    pos_pricelist_widgets(instance, module);
};
