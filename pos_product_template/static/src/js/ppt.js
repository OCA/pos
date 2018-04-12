/* Copyright (C) 2014-Today Akretion (https://www.akretion.com) 
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Navarromiguel (https://github.com/navarromiguel)
    @author Raphaël Reverdy (https://www.akretion.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

odoo.define("pos_product_template.pos_product_template", function(require){
    "use strict";
    
    var screens = require("point_of_sale.screens");
    var popups = require("point_of_sale.popups");
    var models = require('point_of_sale.models');
    var chrome = require('point_of_sale.chrome');
    var gui = require('point_of_sale.gui');
    var PosDB = require("point_of_sale.DB");
    var PosBaseWidget = require('point_of_sale.BaseWidget');

    var core = require('web.core');
    var utils = require('web.utils');

    var QWeb = core.qweb;
    var _t = core._t;
    
    /* ********************************************************
    Overload: point_of_sale.ProductListWidget
    
    - The overload will:
        - display only product template;
        - Add an extra behaviour on click on a template, if template has many
          variant, displaying an extra scren to select the variant;
    *********************************************************** */
    var _render_product_ = screens.ProductListWidget.prototype.render_product;

    screens.ProductScreenWidget.include({
        click_product: function(product) {
            if (product.product_variant_count > 1) {
                this.gui.show_popup('select-variant-popup', product.product_tmpl_id);
            } else {
                this._super(product);
            }
        }
    });
    screens.ProductListWidget.include({

        set_product_list: function(product_list) {
            /* ************************************************
            Overload: 'set_product_list'

            'set_product_list' is a function called before displaying Products.
            (at the beginning, after a category selection, after a research, etc.
            we just remove all products that are not the 'primary variant'
            */
            var list = product_list.filter(function(product) {
                return product.is_primary_variant;
            });
            this._super(list);
        },
        
        render_product: function(product){
            var self = this;
    
            if (product.product_variant_count == 1){
                // Normal Display
                return this._super(product);
            }
            if (!product.is_primary_variant) {
                //because screens.js:556: renderElement is called
                //once before set_product_list
                //So we get product.is_primary_variant
                //which are not to be displayed
                //
                //Here we return mock element for
                //products which will not be displayed
                return document.createElement('div');
            }
            //TODO reuse upper function
            var cached = this.product_cache.get_node(product.id);
            if(!cached) {
                var image_url = this.get_product_image_url(product);
                var product_html = QWeb.render('Template',{
                        widget:  this,
                        product: product,
                        image_url: this.get_product_image_url(product),
                    });
                var product_node = document.createElement('div');
                product_node.innerHTML = product_html;
                product_node = product_node.childNodes[1];
                this.product_cache.cache_node(product.id,product_node);
                return product_node;
            }
            return cached;
        },
    });
    
    /* ********************************************************
    Overload: point_of_sale.PosWidget
    
    - Add a new PopUp 'SelectVariantPopupWidget';
    ************************************************************/
    chrome.Chrome.include({
        /* Overload Section */
        build_widgets: function(){
            this._super();
            this.select_variant_popup = new SelectVariantPopupWidget(this, {});
            this.select_variant_popup.appendTo($(this.$el));
        
            // Hide the popup because all pop up are displayed at the
            // beginning by default
            this.select_variant_popup.hide();
        },
    });
    
    /* ********************************************************
    Define : pos_product_template.SelectVariantPopupWidget
        
    - This widget that display a pop up to select a variant of a Template;
    ***********************************************************/
    var SelectVariantPopupWidget = popups.extend({
        template:'SelectVariantPopupWidget',

        start: function(){
            var self = this;
            // Define Variant Widget
            this.variant_list_widget = new VariantListWidget(this,{});
            this.variant_list_widget.replace(this.$('.placeholder-VariantListWidget'));

            // Define Attribute Widget
            this.attribute_list_widget = new AttributeListWidget(this,{});
            this.attribute_list_widget.replace(this.$('.placeholder-AttributeListWidget'));

            // Add behaviour on Cancel Button
            this.$('#variant-popup-cancel').off('click').click(function(){
                self.hide();
            });
        },

        show: function(product_tmpl_id){
            var self = this;
            var template = this.pos.db.template_by_id[product_tmpl_id];

            // Display Name of Template
            this.$('#variant-title-name').html(template.name);

            // Render Variants
            var variant_ids = this.pos.db.template_by_id[product_tmpl_id].product_variant_ids;
            var variant_list = variant_ids.map(function (variant) {
                return this.pos.db.get_product_by_id(variant);
            }, this);
            this.variant_list_widget.filters = {}
            this.variant_list_widget.set_variant_list(variant_list);

            // Render Attributes
            var attribute_ids = this.pos.db.attribute_by_template_id(template.id);
            var attribute_list = attribute_ids.map(function (attribute) {
                return this.pos.db.get_product_attribute_by_id(attribute);
            }, this);
            this.attribute_list_widget.set_attribute_list(attribute_list, template);
            
            if(this.$el){
                this.$el.removeClass('oe_hidden');
            }
        },
    });
    gui.define_popup({name:'select-variant-popup', widget: SelectVariantPopupWidget});

    /* ********************************************************
    Define: pos_product_template.VariantListWidget
    
    - This widget will display a list of Variants;
    - This widget has some part of code that come from point_of_sale.ProductListWidget;
    ***********************************************************/
    var VariantListWidget = PosBaseWidget.extend({
        template:'VariantListWidget',

        init: function(parent, options) {
            var self = this;
            this._super(parent, options);
            this.variant_list = [];
            this.filter_variant_list = [];
            this.filters = {};
            this.click_variant_handler = function(event){
                var variant = self.pos.db.get_product_by_id(this.dataset['variantId']);
                if(variant.to_weight && self.pos.config.iface_electronic_scale){
                    self.__parentedParent.hide();
                    self.pos_widget.screen_selector.set_current_screen('scale',{product: variant});
                }else{
                    self.__parentedParent.hide();
                    self.pos.get('selectedOrder').add_product(variant);
                }
            };
        },

        replace: function($target){
            this.renderElement();
            var target = $target[0];
            target.parentNode.replaceChild(this.el,target);
        },

        set_filter: function(attribute_id, value_id){
            this.filters[attribute_id] = value_id;
            this.filter_variant();
        },

        reset_filter: function(attribute_id){
            if (attribute_id in this.filters){
                delete this.filters[attribute_id];
            }
            this.filter_variant();
        },

        filter_variant: function(){
            var value_list = [];
            for (var item in this.filters){
                value_list.push(parseInt(this.filters[item]));
            }
            this.filter_variant_list = [];
            for (var index in this.variant_list){
                var variant = this.variant_list[index];
                var found = true;
                for (var i = 0; i < value_list.length; i++){
                    found = found && (variant.attribute_value_ids.indexOf(value_list[i]) != -1);
                }
                if (found){
                    this.filter_variant_list.push(variant);
                }
            }
            this.renderElement();
        },

        set_variant_list: function(variant_list){
            this.variant_list = variant_list;
            this.filter_variant_list = variant_list;
            this.renderElement();
        },

        render_variant: function(variant){
            var variant_html = QWeb.render('VariantWidget', {
                    widget:  this,
                    variant: variant,
                });
            var variant_node = document.createElement('div');
            variant_node.innerHTML = variant_html;
            variant_node = variant_node.childNodes[1];
            return variant_node;
        },

        renderElement: function() {
            var self = this;
            var el_html  = openerp.qweb.render(this.template, {widget: this});
            var el_node = document.createElement('div');
            el_node.innerHTML = el_html;
            el_node = el_node.childNodes[1];
            if(this.el && this.el.parentNode){
                this.el.parentNode.replaceChild(el_node,this.el);
            }
            this.el = el_node;
            var list_container = el_node.querySelector('.variant-list');
            for(var i = 0, len = this.filter_variant_list.length; i < len; i++){
                var variant_node = this.render_variant(this.filter_variant_list[i]);
                variant_node.addEventListener('click',this.click_variant_handler);
                list_container.appendChild(variant_node);
            }
        },

    });
    
    
    /* ********************************************************
    Define: pos_product_template.AttributeListWidget
    
        - This widget will display a list of Attribute;
    ***********************************************************/ 
    var AttributeListWidget = PosBaseWidget.extend({
        template:'AttributeListWidget',

        init: function(parent, options) {
            var self = this;
            this.attribute_list = [];
            this.product_template = null;
            this.click_set_attribute_handler = function(event){
                //TODO: Refactor this function with elegant DOM manipulation 
                // remove selected item
                parent = this.parentElement.parentElement.parentElement;
                parent.children[0].classList.remove('selected');
                for (var i = 0 ; i < parent.children[1].children[0].children.length; i ++){
                    var elem = parent.children[1].children[0].children[i];
                    elem.children[0].classList.remove('selected');
                }
                // add selected item
                this.children[0].classList.add('selected');
                self.__parentedParent.variant_list_widget.set_filter(this.dataset['attributeId'], this.dataset['attributeValueId']);
            };
            this.click_reset_attribute_handler = function(event){
                //TODO: Refactor this function with elegant DOM manipulation 
                // remove selected item
                parent = this.parentElement;
                parent.children[0].classList.remove('selected');
                for (var i = 0 ; i < parent.children[1].children[0].children.length; i ++){
                    var elem = parent.children[1].children[0].children[i];
                    elem.children[0].classList.remove('selected');
                }
                // add selected item
                this.classList.add('selected');
                self.__parentedParent.variant_list_widget.reset_filter(this.dataset['attributeId']);
            };
            this._super(parent, options);
        },

        replace: function($target){
            this.renderElement();
            var target = $target[0];
            target.parentNode.replaceChild(this.el,target);
        },

        set_attribute_list: function(attribute_list, product_template){
            this.attribute_list = attribute_list;
            this.product_template = product_template;
            this.renderElement();
        },

        render_attribute: function(attribute){
            var attribute_html = QWeb.render('AttributeWidget',{
                    widget:  this,
                    attribute: attribute,
                });
            var attribute_node = document.createElement('div');
            attribute_node.innerHTML = attribute_html;
            attribute_node = attribute_node.childNodes[1];
            
            var list_container = attribute_node.querySelector('.value-list');
            for(var i = 0, len = attribute.value_ids.length; i < len; i++){
                var value = this.pos.db.get_product_attribute_value_by_id(attribute.value_ids[i]);
                var product_list = this.pos.db.get_product_by_ids(this.product_template.product_variant_ids);
                var subproduct_list = this.pos.db.get_product_by_value_and_products(value.id, product_list);
                var variant_qty = subproduct_list.length;
                // Hide product attribute value if there is no product associated to it
                if (variant_qty != 0) {
                    var value_node = this.render_value(value, variant_qty);
                    value_node.addEventListener('click', this.click_set_attribute_handler);
                    list_container.appendChild(value_node);
                }
            };
            return attribute_node;
        },

        render_value: function(value, variant_qty){
            var value_html = QWeb.render('AttributeValueWidget',{
                    widget:  this,
                    value: value,
                    variant_qty: variant_qty,
                });
            var value_node = document.createElement('div');
            value_node.innerHTML = value_html;
            value_node = value_node.childNodes[1];
            return value_node;
        },
        
        renderElement: function() {
            var self = this;
            var el_html  = openerp.qweb.render(this.template, {widget: this});
            var el_node = document.createElement('div');
            el_node.innerHTML = el_html;
            el_node = el_node.childNodes[1];
            if(this.el && this.el.parentNode){
                this.el.parentNode.replaceChild(el_node,this.el);
            }
            this.el = el_node;

            var list_container = el_node.querySelector('.attribute-list');
            for(var i = 0, len = this.attribute_list.length; i < len; i++){
                var attribute_node = this.render_attribute(this.attribute_list[i]);
                attribute_node.querySelector('.attribute-name').addEventListener('click', this.click_reset_attribute_handler);
                list_container.appendChild(attribute_node);
            };
        },

    });
    
    /* ********************************************************
    Overload: point_of_sale.PosDB
    
    - Add to local storage Product Templates Data.
    - Link Product Variants to Product Templates.
    - Add an extra field 'is_primary_variant' on product object. the product
        will be display on product list, only if it is the primary variant;
        Otherwise, the product will be displayed only on Template Screen.
    - Add an extra field 'product_variant_count' on product object that
        indicates the number of variant of the template of the product.
    ********************************************************** */ 
    PosDB.include({
        init: function(options){
            this.template_by_id = {};
            this.product_attribute_by_id = {};
            this.product_attribute_value_by_id = {};
            this._super(options);
        },

        get_product_by_value_and_products: function(value_id, products){
            var list = [];
            for (var i = 0, len = products.length; i < len; i++) {
                if (products[i].attribute_value_ids.indexOf(value_id) != -1){
                    list.push(products[i]);
                }
            }
            return list;
        },

        get_product_attribute_by_id: function(attribute_id){
            return this.product_attribute_by_id[attribute_id];
        },

        get_product_attribute_value_by_id: function(attribute_value_id){
            return this.product_attribute_value_by_id[attribute_value_id];
        },

        get_product_by_ids: function(product_ids){
            var list = [];
            for (var i = 0, len = product_ids.length; i < len; i++) {
                list.push(this.product_by_id[product_ids[i]]);
            }
            return list;
        },


        attribute_by_template_id: function(template_id){
            var template = this.template_by_id[template_id];
            return this.attribute_by_attribute_value_ids(template.attribute_value_ids);
        },

        attribute_by_attribute_value_ids: function(value_ids){
            var attribute_ids = [];
            for (var i = 0; i < value_ids.length; i++){
                var value = this.product_attribute_value_by_id[value_ids[i]];
                if (attribute_ids.indexOf(value.attribute_id[0])==-1){
                    attribute_ids.push(value.attribute_id[0]);
                }
            }
            return attribute_ids;
        },

        add_templates: function(templates){
            for(var i=0 ; i < templates.length; i++){
                var attribute_value_ids = [];
                // store Templates
                this.template_by_id[templates[i].id] = templates[i];

                // Update Product information
                for (var j = 0; j <templates[i].product_variant_ids.length; j++){
                    var product = this.product_by_id[templates[i].product_variant_ids[j]]
                    for (var k = 0; k < product.attribute_value_ids.length; k++){
                        if (attribute_value_ids.indexOf(product.attribute_value_ids[k])==-1){
                            attribute_value_ids.push(product.attribute_value_ids[k]);
                        }
                    }
                    product.product_variant_count = templates[i].product_variant_count;
                    product.is_primary_variant = (j==0);
                }
                this.template_by_id[templates[i].id].attribute_value_ids = attribute_value_ids;
            }
        },

        add_product_attributes: function(product_attributes){
            for(var i=0 ; i < product_attributes.length; i++){
                // store Product Attributes
                this.product_attribute_by_id[product_attributes[i].id] = product_attributes[i];
            }
        },

        add_product_attribute_values: function(product_attribute_values){
            for(var i=0 ; i < product_attribute_values.length; i++){
                // store Product Attribute Values
                this.product_attribute_value_by_id[product_attribute_values[i].id] = product_attribute_values[i];
            }
        },
    });

    /*********************************************************
    Overload: point_of_sale.PosModel

    - Overload module.PosModel.initialize function to load extra-data
         - Load 'name' field of model product.product;
         - Load product.template model;
    *********************************************************** */
    // change product.product call
    models.PosModel.prototype.models.some(function (model) {
        if (model.model !== 'product.product') {
            return false;
        }
        // add name and attribute_value_ids to list of fields
        // to fetch for product.product
        ['name', 'attribute_value_ids'].forEach(function (field) {
            if (model.fields.indexOf(field) == -1) {
                model.fields.push(field);
            }
        });
        return true; //exit early the iteration of this.models
    });

    //Add our new models
    models.PosModel.prototype.models.push({
        model: 'product.template',
        fields: [
            'name',
            'display_name',
            'product_variant_ids',
            'product_variant_count',
            ],
        domain:  function(self){
            return [
                ['sale_ok','=',true],
                ['available_in_pos','=',true],
            ];},
        context: function(self){
            return {
                pricelist: self.pricelist.id,
                display_default_code: false,
            };},
        loaded: function(self, templates){
             self.db.add_templates(templates);
        },
    },
    {
        model: 'product.attribute',
        fields: [
            'name',
            'value_ids',
        ],
        loaded: function(self, attributes){
             self.db.add_product_attributes(attributes);
        },
    },
    {
        model: 'product.attribute.value',
        fields: [
            'name',
            'attribute_id',
        ],
        loaded: function(self, values){
             self.db.add_product_attribute_values(values);
        },
    });
    return {
        'SelectVariantPopupWidget': SelectVariantPopupWidget,
        'VariantListWidget': VariantListWidget,
        'AttributeListWidget': AttributeListWidget,
    };
});
