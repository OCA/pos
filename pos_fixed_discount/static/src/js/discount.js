odoo.define('pos_fixed_discount.pos_fixed_discount', function (require) {
"use strict";

var core = require('web.core');
var screens = require('point_of_sale.screens');
var field_utils = require('web.field_utils');

var _t = core._t;

var FixedDiscountButton = screens.ActionButtonWidget.extend({
    template: 'FixedDiscountButton',
    button_click: function(){
        var self = this;
        this.gui.show_popup('number',{
            'title': _t('Discount Amount'),
            'value': 0,
            'confirm': function(val) {
                self.apply_discount(val);
            },
        });
    },
    apply_discount: function(amount) {
        var order    = this.pos.get_order();
        var lines    = order.get_orderlines();
        var product  = this.pos.db.get_product_by_id(this.pos.config.discount_product_id[0]);
        if (product === undefined) {
            this.gui.show_popup('error', {
                title : _t("No discount product found"),
                body  : _t("The discount product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
            });
            return;
        }

        // Remove existing discounts
        var i = 0;
        while ( i < lines.length ) {
            if (lines[i].get_product() === product) {
                order.remove_orderline(lines[i]);
            } else {
                i++;
            }
        }

        // Add discount
        // We add the price as manually set to avoid recomputation when changing customer.
        var discount = - amount.replace(",", ".");

        if( discount < 0 ){
            order.add_product(product, {
                price: discount,
                extras: {
                    price_manually_set: true,
                },
            });
        }
    },
});

screens.define_action_button({
    'name': 'fixed_discount',
    'widget': FixedDiscountButton,
    'condition': function(){
        return this.pos.config.module_pos_discount && this.pos.config.discount_product_id;
    },
});

return {
    FixedDiscountButton: FixedDiscountButton,
}

});
