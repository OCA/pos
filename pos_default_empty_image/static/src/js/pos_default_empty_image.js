'use strict';

openerp.pos_default_empty_image = function (instance) {
	var module = instance.point_of_sale;
	var _t = instance.web._t;

	//don't try to get an image if we know the product ain't one
	module.ProductListWidget = module.ProductListWidget.extend({
		get_product_image_url: function(product){
			if (product.has_image)
				return this._super(product);

			return '/web/static/src/img/placeholder.png';
		}
	});

	//we can't extend it because self.pos not ready yet
	var _initializePosModel_ = module.PosModel.prototype.initialize;
	module.PosModel.prototype.initialize = function(session, attributes){
		//add has_image to the request of product product
		this.models.some(function (m, idx) {
			if (m.model !== "product.product")
				return false;

			//check if not already done by someone else
			if (m.fields.indexOf('has_image') === -1) {
				m.fields.push('has_image');
			}

			return true; //no need to continue
		});
		return _initializePosModel_.call(this, session, attributes);
	};
};
