odoo.define('pos_combinated_drinks.pos', function (require) {
"use strict";

	let PopupWidget = require('point_of_sale.popups');
	let models = require('point_of_sale.models');
	let gui = require('point_of_sale.gui');
	let screens = require('point_of_sale.screens');

	models.load_fields("product.product", ['is_combo', 'combo_price', 'product_combo_ids', 'combo_category_ids']);
	models.load_fields("pos.order.line", ['invisible']);

	let _super_Order = models.Order.prototype;
	models.Order = models.Order.extend({
		add_product: function(product, options){
        	let self = this;
        	if(product.is_combo && product.combo_category_ids.length > 0){

//        	    if (product['combo_price'] != 0){
//        	        options = {'price': product['combo_price']}
//        	    }

            	_super_Order.add_product.call(self, product, options);

        		self.pos.gui.show_popup('combo_product_popup',{
        			'product': product
        		});
        	}
        	else{
            	_super_Order.add_product.call(self, product, options);
        	}
		},
	});

	let _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
    	initialize: function(attr,options){
    	    this.invisible = false;
            this.combo_prod_info = false;
            _super_orderline.initialize.call(this, attr, options);
        },
        init_from_JSON: function(json) {
        	let self = this;
			let new_combo_data = [];

        	_super_orderline.init_from_JSON.apply(this,arguments);

            this.invisible = json.invisible;

			if(json.combo_ext_line_info && json.combo_ext_line_info.length > 0){
				json.combo_ext_line_info.map(function(combo_data){
					if(combo_data[2].product_id){
						let product = self.pos.db.get_product_by_id(combo_data[2].product_id);
						if(product){
							new_combo_data.push({
								'product':product,
								'price':combo_data[2].price,
								'qty':combo_data[2].qty,
								'id':combo_data[2].id,
								'invisible':combo_data[2].invisible,
							});
						}
					}
				});
			}
			self.set_combo_prod_info(new_combo_data);
        },
        set_combo_prod_info: function(combo_prod_info){
        	this.combo_prod_info = combo_prod_info;
        	this.trigger('change',this);
        },
        get_combo_prod_info: function(){
        	return this.combo_prod_info;
        },
        export_as_JSON: function(){
            let self = this;
            let combo_ext_line_info = [];
            let json = _super_orderline.export_as_JSON.call(this,arguments);

            if(this.product.is_combo && this.combo_prod_info.length > 0){
                _.each(this.combo_prod_info, function(item){
                	combo_ext_line_info.push([0, 0, {
                		'product_id':item.product.id, 
                		'qty':item.qty, 
                		'price':item.price,
                		'id':item.id,
                        'invisible':item.invisible,
                	}]);
                });
            }
            json.invisible = this.invisible;
            json.combo_ext_line_info = this.product.is_combo ? combo_ext_line_info : [];
            return json;
        },
        can_be_merged_with: function(orderline){
        	let result = _super_orderline.can_be_merged_with.call(this,orderline);
        	if(orderline.product.id == this.product.id && this.get_combo_prod_info()){
        		return false;
        	}
        	return result;
        },
        export_for_printing: function(){
            let lines = _super_orderline.export_for_printing.call(this);
            lines.combo_prod_info = this.get_combo_prod_info();
            return lines;
        },
        get_display_price: function(){
            let price = this.pos.config.iface_tax_included === 'total' ? this.get_price_with_tax() : this.get_base_price();
            if (this.get_combo_prod_info()){
                this.get_combo_prod_info().forEach(combo => price += combo['price']);
            };
            return price;
        },
        is_invisible: function(){
        	return this.invisible;
        }
    });

	let POSComboProductPopup = PopupWidget.extend({
        template: 'POSComboProductPopup',
        events: _.extend({}, PopupWidget.prototype.events, {
    		'click .product': 'select_product',
    	}),
        show: function(options){
        	let self = this;
            self._super(options);
            self.product = options.product || false;
            self.combo_product_info = options.combo_product_info || false;
            self.combo_products_details = [];
            self.new_combo_products_details = [];
            self.scroll_position = 0;

            self.product.combo_category_ids.map(function(id){
                let products = self.pos.db.get_product_by_category(id);
                products.map(function(product){
                    self.combo_products_details.push(product);
                })
            });
            this.renderElement();
        },
        select_product: function(event){
        	let self = this;
        	let products_info = [];
        	let $el = $(event.currentTarget);
        	let product_id = Number($el.data('product-id'));
        	let line_id = Number($el.data('line-id'));
        	let order = self.pos.get_order();
            let selected_line = order.get_selected_orderline();
            let price_list = self.pos.gui.screen_instances.products.product_list_widget._get_active_pricelist();

            if(selected_line){
                let product = self.pos.db.get_product_by_id(product_id);
                let price = 0;
                if(product){
                    price = product['combo_price'] != 0 ? product['combo_price'] : product.get_price(price_list, 1);
                    products_info.push({
                        'product':product,
                        'id':product_id,
                        'qty':1,
                        'price':price,
                        'invisible':true,
                    });
                    self.pos.get_order().add_product(product, {'price': price, 'extras': {'invisible': true} });
                }
                selected_line.set_combo_prod_info(products_info);
            }else{
                alert("Selected line not found!");
            }
            self.gui.close_popup();
        },
        click_cancel: function(){
        	this.gui.close_popup();
        },
    });
    gui.define_popup({name:'combo_product_popup', widget: POSComboProductPopup});
});