/******************************************************************************
    Copyright (C) 2018 - Today: Akretion (https://www.akretion.com)
    @author: Raphaël Reverdy (https://akretion.com)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/
odoo.define('pos_order_to_sale_order.ui_widgets', function (require) {
    "use strict";
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var stateMachine = require('pos_order_to_sale_order.state_machine');

    var OrderTypeButtonWidget = PosBaseWidget.extend({
        //switch between PoS orders and Sale Orders
        template: 'OrderTypeButtonWidget',
        init: function (parent, options) {
            var self = this;
            this._super(parent, options);
            stateMachine.listeners.push(function (next, prev) {
                self.renderElement();
            });
        },
        renderElement: function() {
            this._super();
            this.$el.click(function (evt) {
                stateMachine.toggle('poso');
            });
        },
        isPosOrder: function() {
            return stateMachine.current.isPosOrder;
        }
    });
    var PayLaterButtonWidget = PosBaseWidget.extend({
        //switch between Draft SO (=Quotation) and something else
        template: 'PayLaterButtonWidget',
        init: function (parent, options) {
            var self = this;
            this._super(parent, options);
            stateMachine.listeners.push(function (next, prev) {
                self.renderElement();
            });
        },
        renderElement: function() {
            this._super();
            this.$el.click(function(evt){
                stateMachine.toggle('draft');
            });
        },
        isQuote: function() {
            return stateMachine.current.name == 'draft';
        }
    });
    var DeliveryButtonWidget = PosBaseWidget.extend({
        //switch between delivery now (PoS order and Sale Order)
        //and Sale Order + confirmed Picking
        template: 'DeliveryButtonWidget',
        init: function (parent, options) {
            var self = this;
            this._super(parent, options);
            stateMachine.listeners.push(function (next, prev) {
                self.renderElement();
            });
        },
        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function(evt){
                if (self.isDisabled()) {
                    return;
                }
                stateMachine.toggle('delivered');
            });
        },
        isPicking: function() {
            return stateMachine.current.isPicking;
        },
        isDisabled: function() {
            var state = stateMachine.current.name;
            return state == 'draft' || state == 'poso';
        }
    });
    return {
        PayLaterButtonWidget: PayLaterButtonWidget,
        DeliveryButtonWidget: DeliveryButtonWidget,
        OrderTypeButtonWidget: OrderTypeButtonWidget,
    };
});
