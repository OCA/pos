odoo.define('pos_orders.pos', function (require) {

  "use strict";

  var core = require('web.core');
  var PosBaseWidget = require('point_of_sale.BaseWidget');
  var screens = require('point_of_sale.screens');
  var gui = require('point_of_sale.gui');
  var chrome = require('point_of_sale.chrome');
  var Model = require('web.DataModel');

  var QWeb = core.qweb;
  var ScreenWidget = screens.ScreenWidget;
  var DomCache = screens.DomCache;

  var OrderListScreenWidget = ScreenWidget.extend({
    template: 'OrderListScreenWidget',

    init: function(parent, options){
      this._super(parent, options);
      this.order_cache = new DomCache();
      this.orders = [];
      this.load_orders();
    },

    auto_back: true,

    show: function() {
      var self = this;
      this._super();

      this.renderElement();
      this.old_order = this.pos.get_order();


      this.$('.back').click(function(){
        self.gui.back();
      });

      // add print function

      if (self.orders.length == 0){
        this.load_orders();
      }

      this.render_list();

      var search_timeout = null;

      if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
        this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
      }

      this.$('.searchbox input').on('keypress',function(event){
        clearTimeout(search_timeout);

        var query = this.value;

        search_timeout = setTimeout(function(){
                           self.perform_search(query,event.which === 13);
                         },70);
      });

      this.$('.searchbox .search-clear').click(function(){
        self.clear_search();
      });

    },

    hide: function() {
      this._super();
    },

    perform_search: function(query, associate_result){
    },

    clear_search: function() {
    },

    render_list: function() {
      var orders = this.orders;
      var contents = this.$el[0].querySelector('.order-list-contents');
      for(var i = 0, len = Math.min(orders.length,1000); i < len; i++){
        var order = orders[i];
        var orderline = this.order_cache.get_node(order.id);
        if(!orderline){
          var orderline_html = QWeb.render('OrderLine',{widget: this, order: order});
          orderline = document.createElement('tbody');
          orderline.innerHTML = orderline_html;
          orderline = orderline.childNodes[1];
          this.order_cache.cache_node(order.id, orderline);
        }
        if( order === this.old_order ){
          orderline.classList.add('highlight');
        }else{
          orderline.classList.remove('highlight');
        }
        contents.appendChild(orderline);
      }
    },

    load_orders: function() {
      var self = this;
      var def = new $.Deferred();
      var fields = ['name','partner_id','date_order', 'amount_total'];
      new Model('pos.order').call('search_read', [[['session_id', '=', this.pos.pos_session.id]], fields]).then(function(results){
        self.orders = results;
      });
    },

    close: function(){
      this._super();
    }

  });

  gui.define_screen({name: 'orderlist', widget: OrderListScreenWidget});

  var widgets = chrome.Chrome.prototype.widgets;

  var ListOrderButtonWidget = PosBaseWidget.extend({
    template: 'ListOrderButtonWidget',

    init: function(parent, options) {
      options = options || {};
      this._super(parent, options);
      this.action = options.action;
      this.label = options.label;
    },

    renderElement: function() {
      var self = this;
      this._super();
      if(this.action){
        this.$el.click(function(){
          self.action();
        });
      }
    }
  });

  widgets.push({
    'name': 'list_orders',
    'widget': ListOrderButtonWidget,
    'append': '.pos-rightheader',
    'args': {
      'label': 'All Orders',
      action: function() {
        var self = this;
        this.$el.click(function(){
          self.gui.show_screen('orderlist');
        });
      }
    }
  });

});
