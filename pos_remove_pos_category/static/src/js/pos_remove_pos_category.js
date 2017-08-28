/******************************************************************************
 *    Point Of Sale - Pricelist for POS Odoo
 *    Copyright (C) 2015-TODAY Akretion (http://www.akretion.com)
 *    @author Sylvain Calador <sylvain.calador@akretion.com>
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

openerp.pos_remove_pos_category = function(instance, local) {
    module = instance.point_of_sale;

    var initialize_original = module.PosModel.prototype.initialize;
    module.PosModel = module.PosModel.extend({

        initialize: function(session, attributes) {

            for (var i = 0 ; i < this.models.length; i++){
                if (this.models[i].model == 'pos.category') {
                    this.models[i].model = 'product.category';
                    this.models[i].domain = [['available_in_pos', '=', true]];
                }
            }
            return initialize_original.call(this, session, attributes);
        }
   });

    //override method js POS (widgets.js)
    //change pos.category by product.category
    module.ProductCategoriesWidget = module.ProductCategoriesWidget.extend({
        get_image_url: function(category){
            return window.location.origin + '/web/binary/image?model=product.category&field=image_medium&id='+category.id;
        }
    });
};
