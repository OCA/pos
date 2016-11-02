/*
    Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_access_right.pos_access_right', function (require) {
    "use strict";

    var screens = require('point_of_sale.screens');
    var chrome = require('point_of_sale.chrome');
    var models = require('point_of_sale.models');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;

/* ********************************************************
point_of_sale.gui
******************************************************** */

    // New function 'display_access_right' to display disabled functions
    gui.Gui.prototype.display_access_right = function(user){
        if (user.groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) != -1){
            $('.numpad-minus').removeClass('pos-disabled-mode');
        }
        else{
            $('.numpad-minus').addClass('pos-disabled-mode');
        }
        if (user.groups_id.indexOf(this.pos.config.group_discount_id[0]) != -1){
            $(".mode-button[data-mode='discount']").removeClass('pos-disabled-mode');
        }
        else{
            $(".mode-button[data-mode='discount']").addClass('pos-disabled-mode');
        }
        if (user.groups_id.indexOf(this.pos.config.group_change_unit_price_id[0]) != -1){
            $(".mode-button[data-mode='price']").removeClass('pos-disabled-mode');
        }
        else{
            $(".mode-button[data-mode='price']").addClass('pos-disabled-mode');
        }
    };


/* ********************************************************
point_of_sale.models
******************************************************** */

    // load extra data from 'pos_config' (ids of new groups)
    models.load_fields("pos.config", "group_negative_qty_id");
    models.load_fields("pos.config", "group_discount_id");
    models.load_fields("pos.config", "group_change_unit_price_id");
    models.load_fields("pos.config", "group_multi_order_id");
    models.load_fields("pos.config", "group_delete_order_id");

    // Overload 'set_cashier' function to display correctly
    // unauthorized function after cashier changed
    var _set_cashier_ = models.PosModel.prototype.set_cashier;
    models.PosModel.prototype.set_cashier = function(user){
        this.gui.display_access_right(user);
        _set_cashier_.call(this, user);
    };

/* ********************************************************
chrome.OrderSelectorWidget
******************************************************** */
    chrome.OrderSelectorWidget.include({

        neworder_click_handler: function(event, $el) {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_multi_order_id[0]) == -1) {
                this.gui.show_popup('error',{
                    'title': _t('Many Orders - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            }
            else {
                return this._super();
            }
        },
        deleteorder_click_handler: function(event, $el) {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_delete_order_id[0]) == -1) {
                this.gui.show_popup('error',{
                    'title': _t('Delete Order - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            }
            else {
                return this._super();
            }
        },
    });


/* ********************************************************
screens.NumpadWidget
******************************************************** */
    screens.NumpadWidget.include({

        // Overload 'start' function to display correctly unauthorized function
        // at the beginning of the session, based on current user
        start: function() {
            this._super();
            this.gui.display_access_right(this.pos.get_cashier());
        },

        // block '+/-' button if user doesn't belong to the correct group
        clickSwitchSign: function() {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) == -1) {
                this.gui.show_popup('error',{
                    'title': _t('Negative Quantity - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            }
            else {
                return this._super();
            }
        },

        // block 'discount' or 'price' button if user doesn't belong to the correct group
        clickChangeMode: function(event) {
            if (event.currentTarget.attributes['data-mode'].nodeValue == 'discount' &&
                    this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_discount_id[0]) == -1) {
                this.gui.show_popup('error',{
                    'title': _t('Discount - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            }
            else if (event.currentTarget.attributes['data-mode'].nodeValue == 'price' &&
                    this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_change_unit_price_id[0]) == -1) {
                this.gui.show_popup('error',{
                    'title': _t('Change Unit Price - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            }
            else {
                return this._super(event);
            }
        },
    });
});
