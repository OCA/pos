odoo.define('pos_order_show_list.screens', function(require) {
"use strict";

var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var core = require('web.core');
var rpc = require('web.rpc');
var session = require('web.session');
var models = require('point_of_sale.models');
var ScreenWidget = screens.ScreenWidget;
var Backbone = window.Backbone;
var QWeb = core.qweb;
var _t = core._t;

var PosModelSuper = models.PosModel;

models.load_models({
    model:  'pos.order',
    fields: ['name', 'partner_id','date_order','amount_total','pos_reference','lines','state','session_id','company_id'],
    loaded: function(self, orders){
        self.paid_orders = orders;
        }
    });

models.load_models({
    model:  'pos.order.line',
    fields: ['product_id', 'qty', 'discount','price_subtotal_incl'],
    loaded: function(self, order_lines){
        self.order_lines = order_lines;
        }
    });

var PosOrderScreenWidget = ScreenWidget.extend({
    template: 'PosOrderScreenWidget',
    back_screen:   'product',
    init: function(parent, options){
        var self = this;
        this._super(parent, options);
    },

    show: function(){
        var self = this;
        this._super();
        this.renderElement();
        this.$('.back').click(function(){
            self.gui.show_screen('products');
        });

        this.render_list(self.pos.paid_orders);

        var search_timeout = null;

        if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
            this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
        }

        this.$('.searchbox input').on('keyup',function(event){
            clearTimeout(search_timeout);
            var query = this.value;
            search_timeout = setTimeout(function(){
                self.perform_search(query,event.which === 13);
            },70);
        });

        this.$('.searchbox .search-clear').click(function(){
            self.clear_search();
        });
        this.$('.refresh').click(function(){
            models.Order.prototype.push_new_order_list();
            self.render_list(self.pos.paid_orders);
        });
    },

    get_orders: function(){
        return this.gui.get_current_screen_param('orders');
    },

    render_list: function(orders){
        var contents = this.$el[0].querySelector('.order-list-contents');
        contents.innerHTML = "";
        for(var i = 0, len = Math.min(orders.length,1000); i < len; i++){
            var order   = orders[i];
            var order_line_html = QWeb.render('PosOrderLine',{widget: this, order:order});
            var order_line = document.createElement('tbody');
            order_line.innerHTML = order_line_html;
            order_line = order_line.childNodes[1];
            contents.appendChild(order_line);
        }
    },

    perform_search: function(query, associate_result){
        var orders;
        if(query){
            orders = this.search_order(query);
            this.render_list(orders);
        }else{
            orders = this.pos.paid_orders;
            this.render_list(orders);
        }
    },
    clear_search: function(){
        var orders = this.pos.paid_orders;
        this.render_list(orders);
        this.$('.searchbox input')[0].value = '';
        this.$('.searchbox input').focus();
    },

    search_order: function(query){
        try {
            var re = RegExp(query, 'i');
        }catch(e){
            return [];
        }
        var results = [];
        for (var order_id in this.pos.paid_orders){
            var r = re.exec(this.pos.paid_orders[order_id]['name']+ '|'+ this.pos.paid_orders[order_id]['partner_id'][1]);
            if(r){
            results.push(this.pos.paid_orders[order_id]);
            }
        }
        return results;
    },

});

gui.define_screen({name:'order_list', widget: PosOrderScreenWidget});

var OrderListButton = screens.ActionButtonWidget.extend({
    template: 'OrderListButton',
    button_click: function(){
        var orders = this.pos.paid_orders;
        this.gui.show_screen('order_list',{orders:orders});
    }
});

screens.define_action_button({
    'name': 'pos_order_list',
    'widget': OrderListButton,
});

var _super_order = models.Order.prototype;
models.Order = models.Order.extend({
    finalize: function(){
        this.push_new_order_list();
        _super_order.finalize.apply(this, arguments);
    },
    push_new_order_list: function(){
        var self = this;
        var order_screen = posmodel.gui.screen_instances.order_list;
        var fields = _.find(posmodel.models,function(model){ return model.model === 'pos.order'; }).fields;
        var line_fields = _.find(posmodel.models,function(model){ return model.model === 'pos.order.line'; }).fields;
        rpc.query({
            model: 'pos.order',
            method: 'search_read',
            args: [[], fields],
            limit: 40,
        }).then(function (orders){
            posmodel.paid_orders = orders;
        });
    },
});

return {
    PosOrderScreenWidget: PosOrderScreenWidget,
    OrderListButton: OrderListButton
};

});
