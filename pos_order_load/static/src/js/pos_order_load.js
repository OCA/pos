/******************************************************************************
 * Point Of Sale - Product Template module for Odoo
 * Copyright (C) 2014-Today Akretion (http://www.akretion.com)
 * @author Sylvain Calador (sylvain.calador@akretion.com)
 * @author Sylvain Le Gal (https://twitter.com/legalsylvain)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *****************************************************************************/

odoo.define('pos_order_load', function (require) {
"use strict";

    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var chrome = require('point_of_sale.chrome');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var Model = require('web.DataModel');

    var utils = require('web.utils');
    var round_pr = utils.round_precision;

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;


    /*************************************************************************
        Extend Model Order:
     * Add getter and setter function for field 'order_id';
     */

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({


        set_order_id: function(id) {
            this.set({
                order_id: id,
            });
        },

        get_order_id: function() {
            return this.get('order_id');
        },

    });

    /*************************************************************************
        New Widget LoadButtonWidget:
     * On click, display a new screen to select draft orders;
     */
    var LoadButtonWidget = PosBaseWidget.extend({
        template: 'LoadButtonWidget',

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function(){
                self.gui.show_screen('orderlist');
            });
        },
    });

    /*************************************************************************
        New Widget SaveButtonWidget:
     * On click, save the current draft order;
     */
    var SaveButtonWidget = PosBaseWidget.extend({
        template: 'SaveButtonWidget',

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function(){
                self.gui.show_popup('confirm',{
                    message: _t('Save The current Order ?'),
                    comment: _t('This operation will save the current order in a draft state. You\'ll have to mark it as paid after.'),
                    confirm: function(){
                        var currentOrder = this.pos.get('selectedOrder');
                        this.pos.push_order(currentOrder);
                        self.pos.get('selectedOrder').destroy();
                    },
                });
            });
        },
    });


    /*************************************************************************
        Extend PosWidget:
     * Create new screen;
     * Add load and save button;
     */
    chrome.Chrome.include({
        build_widgets: function() {
            this._super();

            this.load_button = new LoadButtonWidget(this, {});
            this.load_button.appendTo(this.$('div.order-empty'));

            this.save_button = new SaveButtonWidget(this, {});

        },
    });


    /*************************************************************************
     * Extend OrderWidget:
     */
    screens.OrderWidget.include({
        renderElement: function(scrollbottom){
            this._super(scrollbottom);
            if (this.chrome.load_button) {
                this.chrome.load_button.appendTo(
                    this.chrome.$('div.order-empty')
                );
            }
            if (this.pos.get_order()) {
                if (this.chrome.save_button && (this.pos.get_order().get_orderlines().length > 0)) {
                    this.chrome.save_button.appendTo(
                        this.chrome.$('div.summary')
                    );
                }
            }
        }
    });

    /*************************************************************************
     * New ScreenWidget OrderListScreenWidget:
     * On show, display all draft orders;
     * on click on an order, display the content;
     * on click on 'validate', allow to use this POS Order;
     * on click on 'cancel', display the preview screen;
     */
    //
    var OrderListScreenWidget = screens.ScreenWidget.extend({
        template: 'OrderListScreenWidget',
        show_leftpane: true,
        model: 'pos.order',
        current_order_id: 0,

        init: function(parent, options){
            this._super(parent, options);
        },

        reset_order: function(order) {
            order.set_client(undefined);
            order.set_order_id(undefined);
            order.orderlines.reset();
            return order;
        },

        start: function() {
            var self = this;
            this._super();
            this.$el.find('span.button.back').click(function(){
                var order = self.pos.get('selectedOrder');
                self.reset_order(order);
                self.chrome.screens.products.order_widget.change_selected_order();
                self.gui.show_screen('products');
            });
            this.$el.find('span.button.validate').click(function(){
                var orderModel = new Model('pos.order');
                return orderModel.call('unlink', [[self.current_order_id]])
                    .then(function (result) {
                        self.gui.show_screen('products');
                    }).fail(function (error, event){
                        if (parseInt(error.code) === 200) {
                            // Business Logic Error, not a connection problem
                            self.gui.show_popup(
                                'error-traceback', {
                                    message: error.data.message,
                                    comment: error.data.debug
                                });
                        }
                        else{
                            self.gui.show_popup('error',{
                                message: _t('Connection error'),
                                comment: _t('Can not load the Selected Order because the POS is currently offline'),
                            });
                        }
                        event.preventDefault();
                    });
            });

            var search_timeout = null;

            this.$('.searchbox input').on('keyup',function(event){
                clearTimeout(search_timeout);

                var query = this.value;

                search_timeout = setTimeout(function(){
                    self.perform_search(query);
                },70);

            });

            this.$('.searchbox .search-clear').click(function(){
                self.clear_search();
            });

        },

        // to override if necessary
        add_product_attribute: function(product, key, orderline){
            return product;
        },

        load_order_fields: function(order, fields) {
            order.set_order_id(fields.id);
            var partner = this.pos.db.get_partner_by_id(
                fields.partner_id);
            order.set_client(partner || undefined);
            return order;
        },

        prepare_orderline_options: function(orderline) {
            return {
                quantity: orderline.qty,
                price: orderline.price_unit,
                discount: orderline.discount,
            };
        },

        load_order: function(order_id) {
            var self = this;
            var orderModel = new Model(this.model);
            return orderModel.call('load_order', [order_id])
                .then(function (result) {
                    var order = self.pos.get('selectedOrder');
                    order = self.load_order_fields(order, result);
                    order.orderlines.reset();
                    var orderlines = result.orderlines || [];
                    var unknown_products = [];
                    for (var i=0, len=orderlines.length; i<len; i++) {
                        var orderline = orderlines[i];
                        var product_id = orderline.product_id[0];
                        var product_name = orderline.product_id[1];
                        var product = self.pos.db.get_product_by_id(product_id);
                        if (_.isUndefined(product)) {
                            unknown_products.push(product_name);
                            continue;
                        }

                        for (var key in orderline) {
                            if (!key.indexOf('product__')) {
                                product = self.add_product_attribute(
                                    product, key, orderline
                                );
                            }
                        }

                        order.add_product(product,
                            self.prepare_orderline_options(orderline)
                        );
                        var last_orderline = order.get_last_orderline();
                        last_orderline = jQuery.extend(last_orderline, orderline);
                    }
                    // Forbid POS Order loading if some products are unknown
                    if (unknown_products.length > 0){
                        self.gui.show_popup(
                            'error-traceback', {
                                message: _t('Unknown Products'),
                                comment: _t('Unable to load some order lines because the ' +
                                    'products are not available in the POS cache.\n\n' +
                                    'Please check that lines :\n\n  * ') + unknown_products.join("; \n  *")
                            });
                        self.$el.find('span.button.validate').hide();
                    }
                    else{
                        self.$el.find('span.button.validate').show();
                    }

                }).fail(function (error, event){
                    if (parseInt(error.code) === 200) {
                        // Business Logic Error, not a connection problem
                        self.gui.show_popup(
                            'error-traceback', {
                                message: error.data.message,
                                comment: error.data.debug
                            });
                    }
                    else{
                        self.gui.show_popup('error',{
                            message: _t('Connection error'),
                            comment: _t('Can not execute this action because the POS is currently offline'),
                        });
                    }
                    event.preventDefault();
                });
        },

        load_orders: function(query) {
            var self = this;
            var orderModel = new Model(this.model);
            return orderModel.call('search_read_orders', [query || ''])
                .then(function (result) {
                    self.render_list(result);
                }).fail(function (error, event){
                    if (parseInt(error.code) === 200) {
                        // Business Logic Error, not a connection problem
                        self.gui.show_popup(
                            'error-traceback', {
                                message: error.data.message,
                                comment: error.data.debug
                            }
                        );
                    }
                    else{
                        self.gui.show_popup('error',{
                            message: _t('Connection error'),
                            comment: _t('Can not execute this action because the POS is currently offline'),
                        });
                    }
                    event.preventDefault();
                });
        },

        show: function() {
            this._super();
            if (this.gui.get_current_screen() == 'orderlist') {
                this.load_orders();
            }
        },

        on_click_draft_order: function(event){
            this.$('.order-list .highlight').removeClass('highlight');
            this.current_order_id = parseInt(event.target.parentNode.dataset.orderId);
            this.load_order(this.current_order_id);
            $(event.target.parentNode).addClass('highlight');
        },

        render_list: function(orders){
            var self = this;
            var contents = this.$el[0].querySelector('.order-list-contents');
            contents.innerHTML = "";
            for (var i = 0, len = orders.length; i < len; i++){
                var order = orders[i];
                var orderline_html = QWeb.render('LoadOrderLine',
                    {widget: this, order:orders[i]});
                var orderline = document.createElement('tbody');
                orderline.innerHTML = orderline_html;
                orderline = orderline.childNodes[1];
                orderline.addEventListener('click', this.on_click_draft_order);
                contents.appendChild(orderline);
            }
        },

        perform_search: function(query){
            this.load_orders(query);
        },

        clear_search: function(){
            this.load_orders();
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
        },

    });
gui.define_screen({'name': 'orderlist', 'widget': OrderListScreenWidget});
return {
    LoadButtonButton: LoadButtonWidget,
    SaveButtonButton: SaveButtonWidget,
    OrderListScreenWidget: OrderListScreenWidget,
};
});
