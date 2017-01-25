/******************************************************************************
 * Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
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
