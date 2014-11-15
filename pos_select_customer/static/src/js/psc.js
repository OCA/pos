/******************************************************************************
    Point Of Sale - Select Customer module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
    @author Julien WESTE
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

openerp.pos_select_customer = function (instance) {
    module = instance.point_of_sale;
    _t = instance.web._t;

    /*************************************************************************
        Define : CustomerOrderWidget that display the name of the customer
        of the current pos order and display button to select of remove it.
    */
    module.CustomerOrderWidget = module.PosBaseWidget.extend({
        template: 'CustomerOrderWidget',

        /* Overload Section */
        init: function(parent, options){
            this._super(parent,options);
            this.pos.bind('change:selectedOrder', this.refresh, this);
        },

        start: function(){
            this._super();
            this._build_widgets();
        },

        /* Custom Section */
        refresh: function(){
            this.renderElement();
            this._build_widgets();
        },

        _build_widgets: function(){
            // Create a button to open the customer popup
            this.select_customer_button = new module.HeaderButtonWidget(this,{
                label:_t('Customer'),
                action: function(){
                    self.screen_selector.show_popup('select-customer');
                },
            });
            this.select_customer_button.replace($('.placeholder-SelectCustomerButton'));
            this.select_customer_button.renderElement();

            if (this.get_name() !== ''){
                // Create a button to remove the current customer
                this.remove_customer_button = new module.HeaderButtonWidget(this,{
                    label:_t('Del.'),
                    action: function(){
                        this.pos.get('selectedOrder').set_client(undefined);
                        this.pos_widget.customer_order.refresh();
                        this.hide();
                    },
                });
                this.remove_customer_button.replace($('.placeholder-RemoveCustomerButton'));
                this.remove_customer_button.renderElement();
            }
        },

        get_name: function(){
            customer = this.pos.get('selectedOrder').get_client();
            if(customer){
                return customer.name;
            }else{
                return "";
            }
        },
    });

    /*************************************************************************
        Define : CustomerWidget that display a customer
    */
    module.CustomerWidget = module.PosBaseWidget.extend({
        template: 'CustomerWidget',

        /* Overload Section */
        init: function(parent, options) {
            this._super(parent,options);
            this.model = options.model;
        },

        renderElement: function() {
            this._super();
            this.$('img').replaceWith(this.pos_widget.image_cache.get_image(this.model.get_image_small_url()));
            var self = this;
            $("a", this.$el).click(function(e){
                self.pos.get('selectedOrder').set_client(self.model.toJSON());
                self.pos_widget.customer_order.refresh();
                self.pos_widget.screen_selector.set_current_screen('products');
            });
        },
    });

    /*************************************************************************
        Define : CustomerListScreenWidget that display a list of customers.
    */
    module.CustomerListScreenWidget = module.ScreenWidget.extend({
        template:'CustomerListScreenWidget',

        init: function(parent, options) {
            this._super(parent,options);
            this.customer_list = [];
        },

        start: function() {
            this._super();
            var self = this;
        },

        renderElement: function() {
            this._super();
            var self = this;
            // Delete old customers widget and display refreshed customers list
            for(var i = 0, len = this.customer_list.length; i < len; i++){
                this.customer_list[i].destroy();
            }
            this.customer_list = [];
            var customers = this.pos.get('customer_list_filter') || [];
            for(var i = 0, len = customers.models.length; i < len; i++){
                var customer = new module.CustomerWidget(this, {
                    model: customers.models[i],
                    click_product_action: this.click_product_action,
                });
                this.customer_list.push(customer);
                customer.appendTo(this.$('.customer-list'));
            }

            // Delete old scrollbar widget and display refreshed scrollbar
            if(this.scrollbar){
                this.scrollbar.destroy();
            }
            this.scrollbar = new module.ScrollbarWidget(this,{
                target_widget:   this,
                target_selector: '.customer-list-scroller',
                on_show: function(){
                    self.$('.customer-list-scroller').css({'padding-right':'62px'},100);
                },
                on_hide: function(){
                    self.$('.customer-list-scroller').css({'padding-right':'0px'},100);
                },
            });
            this.scrollbar.replace(this.$('.placeholder-ScrollbarWidget'));
        },
    }),

    /*************************************************************************
        Define : SelectCustomerPopupWidget that display a pop up to search
        and select customers.
    */
    module.SelectCustomerPopupWidget = module.PopUpWidget.extend({
        template:'SelectCustomerPopupWidget',
        
        start: function(){
            this._super();
            var self = this;
            this.customer_list_widget = new module.CustomerListScreenWidget(this,{});
        },

        show: function(){
            this._super();
            var self = this;
            this.reset_customers();
            this.customer_list_widget.replace($('.placeholder-CustomerListScreenWidget'));
            this.$('#customer-cancel').off('click').click(function(){
                self.pos_widget.screen_selector.set_current_screen('products');
            });
            // filter customers according to the search string
            this.$('.customer-searchbox input').keyup(function(event){
                pattern = $(this).val().toLowerCase();
                if(pattern){
                    var customers = self.pos.get('customer_list').search_customer(pattern);
                    self.pos.set({'customer_list_filter' : customers});
                    self.$('.customer-search-clear').fadeIn();
                    self.customer_list_widget.renderElement();
                }
                else{
                    self.reset_customers();
                }
            });
            //reset the search when clicking on reset
            this.$('.customer-search-clear').click(function(){
                self.reset_customers();
            });
        },

        reset_customers: function(){
            this.pos.set({'customer_list_filter' : this.pos.get('customer_list')});
            this.$('.customer-search-clear').fadeOut();
            this.customer_list_widget.renderElement();
            this.$('.customer-searchbox input').val('').focus();
        },

    });


    /*************************************************************************
        Overload : PosWidget to include button in PosOrderHeaderWidget widget
        to select or unselect customers
    */
    module.PosWidget = module.PosWidget.extend({

        build_widgets: function(){
            this._super();
            var self = this;

            // Add a widget to manage customer
            this.customer_order = new module.CustomerOrderWidget(this,{});
            this.customer_order.appendTo(this.$('#pos_order_header'));

            // create a pop up 'select-customer' to search and select customers
            this.select_customer_popup = new module.SelectCustomerPopupWidget(this, {});
            this.select_customer_popup.appendTo($('.point-of-sale'));
            this.select_customer_popup.hide();
            this.screen_selector.popup_set['select-customer'] = this.select_customer_popup;

        },
    });

    /*************************************************************************
        Define : New Model 'Customer'
    */
    module.Customer = Backbone.Model.extend({
        get_image_small_url: function(){
            return instance.session.url('/web/binary/image', {model: 'res.partner', field: 'image_small', id: this.get('id')});
        },
    });

    module.CustomerCollection = Backbone.Collection.extend({
        model: module.Customer,
        
        search_customer: function(pattern){
            res = new module.CustomerCollection();
            var reg = RegExp(pattern,"i");
            for(var i = 0, len = this.models.length; i < len; i++){
                res_reg = reg.exec(this.models[i].attributes.name);
                if (res_reg){
                    res.push(this.models[i]);
                }
            }
            return res;
        },
    });

    /*
        Overload: PosModel.initialize() to define two new lists.
        'customer_list' are the list of all customers available;
        'customer_list_filter' are a sub-list according to the current filter
        selection.
    */
    var _initialize_ = module.PosModel.prototype.initialize;
    module.PosModel.prototype.initialize = function(session, attributes){
         _initialize_.call(this, session, attributes);
        this.set({
            'customer_list': new module.CustomerCollection(),
            'customer_list_filter': new module.CustomerCollection(),
        });
    };

    /*
        Overload: PosModel.load_server_data() function to get in memory
        customers.
        The function will load all usefull informations even if any
        informations won't be used in this module, to allow further modules
        to use them.
    */
    var _load_server_data_ = module.PosModel.prototype.load_server_data;
    module.PosModel.prototype.load_server_data = function(){
        var self = this;
        var load_def = _load_server_data_.call(self).done(self.load_customers_data());
        return load_def;
    },

    module.PosModel = module.PosModel.extend({
        load_customers_data: function(){
            var self = this;
            var loaded = self.fetch(
                    'res.partner',
                    ['name','display_name','title','function','type',
                    'parent_id','is_company',
                    'lang','company_id','ean13','color',
                    'contact_address','street','street2','city','zip','state_id','country_id',
                    'property_product_pricelist','vat','debit_limit','credit_limit',
                    'email','website','fax','phone','mobile',],
                    [['customer', '=', true]])
                .then(function(customers){
                    console.log(customers);
                    self.set({'customer_list' : new module.CustomerCollection(customers)});
                    self.set({'customer_list_filter' : new module.CustomerCollection(customers)});
                });
            return loaded;
        },
    });
};

