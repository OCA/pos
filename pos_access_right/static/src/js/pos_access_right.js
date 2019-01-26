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
    var Model = require('web.DataModel');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var _t = core._t;

    /* ********************************************************
    Point_of_sale.gui
    ******************************************************** */

    // New function 'display_access_right' to display disabled functions
    gui.Gui.prototype.display_access_right = function (user) {
        var records = new Model('res.users')
            .query(['groups_id'])
            .filter([['id', '=', user.id]])
            .all();
        var groups_id = [];
        var group_negative_qty_id = this.pos.config.group_negative_qty_id[0];
        var group_discount_id = this.pos.config.group_discount_id[0];
        var group_price_id = this.pos.config.group_change_unit_price_id[0];
        var dis_mode = 'pos-disabled-mode';
        records.then(function (result) {
            groups_id = result[0].groups_id;
            if (groups_id.indexOf(group_negative_qty_id) === -1) {
                $('.numpad-minus').addClass(dis_mode);
            } else {
                $('.numpad-minus').removeClass(dis_mode);
            }
            if (groups_id.indexOf(group_discount_id) === -1) {
                $(".mode-button[data-mode='discount']").addClass(dis_mode);
            } else {
                $(".mode-button[data-mode='discount']").removeClass(dis_mode);
            }
            if (groups_id.indexOf(group_price_id) === -1) {
                $(".mode-button[data-mode='price']").addClass(dis_mode);
            } else {
                $(".mode-button[data-mode='price']").removeClass(dis_mode);
            }
        }
        );

    };


    /* ********************************************************
    Point_of_sale.models
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
    models.PosModel.prototype.set_cashier = function (user) {
        this.gui.display_access_right(user);
        _set_cashier_.call(this, user);
    };

    /* ********************************************************
    Chrome.OrderSelectorWidget
    ******************************************************** */
    chrome.OrderSelectorWidget.include({

        neworder_click_handler: function (event, $el) {
            var user = this.pos.get_cashier();
            var records = new Model('res.users')
                .query(['groups_id'])
                .filter([['id', '=', user.id]])
                .all();
            var groups_id = [];
            var group_multi_order_id = this.pos.config.group_multi_order_id[0];
            var v_gui = this.gui;
            records.then(function (result) {
                groups_id = result[0].groups_id;
                if (groups_id.indexOf(group_multi_order_id) === -1) {
                    v_gui.show_popup('error', {
                        'title': _t('Many Orders - Unauthorized function'),
                        'body':  _t('Please ask your manager to do it.'),
                    });
                }
            }
            );
            return this._super(event, $el);
        },
        deleteorder_click_handler: function (event, $el) {
            var user = this.pos.get_cashier();
            var records = new Model('res.users')
                .query(['groups_id'])
                .filter([['id', '=', user.id]])
                .all();
            var groups_id = [];
            var group_del_order_id = this.pos.config.group_delete_order_id[0];
            var v_gui = this.gui;
            records.then(function (result) {
                groups_id = result[0].groups_id;
                if (groups_id.indexOf(group_del_order_id) === -1) {
                    v_gui.show_popup('error', {
                        'title': _t('Delete Order - Unauthorized function'),
                        'body':  _t('Please ask your manager to do it.'),
                    });
                }
            }
            );
            return this._super(event, $el);
        },
    });


    /* ********************************************************
    Screens.NumpadWidget
    ******************************************************** */
    screens.NumpadWidget.include({

        // Overload 'start' function to display correctly unauthorized function
        // at the beginning of the session, based on current user
        start: function () {
            this._super();
            this.gui.display_access_right(this.pos.get_cashier());
        },

        // Block '+/-' button if user doesn't belong to the correct group
        clickSwitchSign: function () {
            var user = this.pos.get_cashier();
            var records = new Model('res.users')
                .query(['groups_id'])
                .filter([['id', '=', user.id]])
                .all();
            var groups_id = [];
            var group_neg_qty_id = this.pos.config.group_negative_qty_id[0];
            var v_gui = this.gui;
            records.then(function (result) {
                groups_id = result[0].groups_id;
                if (groups_id.indexOf(group_neg_qty_id) === -1) {
                    v_gui.show_popup('error', {
                        'title':
                            _t('Negative Quantity - Unauthorized function'),
                        'body':  _t('Please ask your manager to do it.'),
                    });
                }
            }
            );
            return this._super();
        },

        // Block 'discount' or 'price' button if user doesn't belong to the
        // Correct group
        clickChangeMode: function (event) {
            var user = this.pos.get_cashier();
            var records = new Model('res.users')
                .query(['groups_id'])
                .filter([['id', '=', user.id]])
                .all();
            var groups_id = [];
            var group_discount_id = this.pos.config.group_discount_id[0];
            var group_price_id = this.pos.config.group_change_unit_price_id[0];
            var v_gui = this.gui;
            var data_mode= event.currentTarget.attributes['data-mode'];
            records.then(function (result) {
                groups_id = result[0].groups_id;
                if (event.currentTarget.attributes['data-mode'].nodeValue ===
                        'discount' &&
                        groups_id.indexOf(group_discount_id) === -1) {
                    v_gui.show_popup('error', {
                        'title': _t('Discount - Unauthorized function'),
                        'body':  _t('Please ask your manager to do it.'),
                    });
                } else if (data_mode.nodeValue === 'price' &&
                        groups_id.indexOf(group_price_id) === -1) {
                    v_gui.show_popup('error', {
                        'title':
                             _t('Change Unit Price - Unauthorized function'),
                        'body':  _t('Please ask your manager to do it.'),
                    });
                }
            }
            );
            return this._super(event);

        },
    });
});
