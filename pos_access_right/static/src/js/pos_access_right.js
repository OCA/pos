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
    var core = require('web.core');
    var _t = core._t;

    chrome.OrderSelectorWidget.include({

        /**
         * Click new order
         * @param {MouseEvent} event
         * @param {HTMLElement | jQuery} $el
         */
        neworder_click_handler: function (event, $el) {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_multi_order_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Create Orders - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                this._super(event, $el);
            }
        },

        /**
         * Click delete order
         * @param {MouseEvent} event
         * @param {HTMLElement | jQuery} $el
         */
        deleteorder_click_handler: function (event, $el) {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_delete_order_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Delete Order - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                this._super(event, $el);
            }
        },

        /**
         * Render order selector
         */
        renderElement: function () {
            this._super();
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_multi_order_id[0]) === -1) {
                this.$('.neworder-button').addClass('pos-disabled-mode');
            } else {
                this.$('.neworder-button').removeClass('pos-disabled-mode');
            }
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_delete_order_id[0]) === -1) {
                this.$('.deleteorder-button').addClass('pos-disabled-mode');
            } else {
                this.$('.deleteorder-button').removeClass('pos-disabled-mode');
            }
        },
    });

    chrome.UsernameWidget.include({

        /**
         * Change cashier
         */
        click_username: function () {
            var user = this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_change_cashier_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Change Cashier - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                this._super();
            }
        },
    });

    var _super_numpad = models.NumpadState.prototype;
    models.NumpadState = models.NumpadState.extend({

        /**
         *  Reset current mode and clear buffer
         */
        reset: function () {
            var pos = window.posmodel;
            var user = pos.get('cashier') || pos.get_cashier();
            if (user.groups_id.indexOf(pos.config.group_change_qty_id[0]) === -1) {
                // We cannot set the 'quantity' mode if this mode is disabled
                this.set({buffer:'0'});
            } else {
                _super_numpad.reset.apply(this, arguments);
            }
        },
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({

        /**
         * Add product
         * @param {Object} product
         * @param {Object} options
         */
        add_product: function (product, options) {
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_create_order_line_id[0]) === -1) {
                this.pos.gui.show_popup('error', {
                    'title': _t('Create Order Line - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                _super_order.add_product.apply(this, arguments);
            }
        },
    });

    screens.NumpadWidget.include({

        /**
         *  Block mods/numpad if a user doesn't belong to the correct group
         */
        applyAccessRights: function () {
            this._super();
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            // Numpad access
            if (user.groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) === -1) {
                this.$('.numpad-minus').addClass('pos-disabled-mode');
            } else {
                this.$('.numpad-minus').removeClass('pos-disabled-mode');
            }
            if (user.groups_id.indexOf(this.pos.config.group_change_qty_id[0]) === -1) {
                this.$(".mode-button[data-mode='quantity']").addClass('pos-disabled-mode');
                this.state.changeMode('discount');
            } else {
                this.$(".mode-button[data-mode='quantity']").removeClass('pos-disabled-mode');
            }
            if (user.groups_id.indexOf(this.pos.config.group_discount_id[0]) === -1) {
                this.$(".mode-button[data-mode='discount']").addClass('pos-disabled-mode');
                this.state.changeMode('price');
            } else {
                this.$(".mode-button[data-mode='discount']").removeClass('pos-disabled-mode');
            }
            if (user.groups_id.indexOf(this.pos.config.group_change_unit_price_id[0]) === -1) {
                this.$(".mode-button[data-mode='price']").addClass('pos-disabled-mode');
            } else {
                this.$(".mode-button[data-mode='price']").removeClass('pos-disabled-mode');
            }
            // Disable numpad if all mods are not active
            if (user.groups_id.indexOf(this.pos.config.group_change_qty_id[0]) === -1 &&
                user.groups_id.indexOf(this.pos.config.group_discount_id[0]) === -1 &&
                user.groups_id.indexOf(this.pos.config.group_change_unit_price_id[0]) === -1) {
                this.$('.input-button').addClass('pos-disabled-mode');
                this.disable_numpad = true;
            } else {
                this.$('.input-button').removeClass('pos-disabled-mode');
                this.disable_numpad = false;
            }
        },

        /**
         * Block '+/-' button if user doesn't belong to the correct group
         * @returns {Object}
         */
        clickSwitchSign: function () {
            if (this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_negative_qty_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Negative Quantity - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                return this._super();
            }
        },

        /**
         * Block 'discount' or 'price' button if user doesn't belong to the correct group
         * @param {MouseEvent} event
         * @returns {Object}
         */
        clickChangeMode: function (event) {
            var line = this.pos.get_order().get_selected_orderline();
            if (event.currentTarget.attributes['data-mode'].nodeValue === "quantity" && line && line.quantity <= 0 &&
                this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_delete_order_line_id[0]) === -1) {
                this.$('.numpad-backspace').addClass('pos-disabled-mode');
            } else {
                this.$('.numpad-backspace').removeClass('pos-disabled-mode');
            }
            if (event.currentTarget.attributes['data-mode'].nodeValue === 'discount' &&
                this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_discount_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Discount - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else if (event.currentTarget.attributes['data-mode'].nodeValue === 'price' &&
                this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_change_unit_price_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Change Unit Price - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else if (event.currentTarget.attributes['data-mode'].nodeValue === 'quantity' &&
                this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_change_qty_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Change Quantity - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                return this._super(event);
            }
        },

        /**
         * Append new char
         * @param {MouseEvent} event
         * @returns {Object}
         */
        clickAppendNewChar: function (event) {
            if (this.disable_numpad) {
                // Show popup if disabled all mods
                this.gui.show_popup('error', {
                    'title': _t('Cannot use the numpad - All modes disabled'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                return this._super(event);
            }
        },

        /**
         * Block 'backspace' button if user doesn't belong to the correct group
         * @returns {Object}
         */
        clickDeleteLastChar: function () {
            var order = this.pos.get_order();
            if (this.state.get('mode') === "quantity" &&
                order.get_selected_orderline() &&
                order.get_selected_orderline().quantity <= 0 &&
                this.pos.get_cashier().groups_id.indexOf(this.pos.config.group_delete_order_line_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Cannot remove orderline - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                return this._super();
            }
        },
    });

    screens.ActionpadWidget.include({

        /**
         * Start check access rights
         */
        start: function () {
            // New function - check actions access
            this.applyAccessRights();
            this.pos.bind('change:cashier', this.applyAccessRights, this);
            this._super();
        },

        /**
         * Check and apply access rights
         */
        applyAccessRights: function () {
            // Action pad access
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_payment_order_id[0]) === -1) {
                this.$(".pay").addClass('pos-disabled-mode');
            } else {
                this.$(".pay").removeClass('pos-disabled-mode');
            }
            if (user.groups_id.indexOf(this.pos.config.group_change_customer_id[0]) === -1) {
                this.$(".set-customer").addClass('pos-disabled-mode');
            } else {
                this.$(".set-customer").removeClass('pos-disabled-mode');
            }
        },

        /**
         * Render action pad and set a new event handler
         */
        renderElement: function () {
            this._super();
            this.$('.pay').unbind();
            this.$('.pay').click(this.clickPayment.bind(this));
            this.$('.set-customer').unbind();
            this.$('.set-customer').click(this.clickSetCustomer.bind(this));
        },

        /**
         * Event handler after clicking on the payment button
         */
        clickPayment: function () {
            var self = this;
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_payment_order_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Payment - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                // Copy past from /point_of_sale/static/src/js/screens.js#L447
                var order = self.pos.get_order();
                var has_valid_product_lot = _.every(order.orderlines.models, function (line) {
                    return line.has_valid_product_lot();
                });
                if (has_valid_product_lot) {
                    this.gui.show_screen('payment');
                } else {
                    this.gui.show_popup('confirm', {
                        'title': _t('Empty Serial/Lot Number'),
                        'body':  _t('One or more product(s) required serial/lot number.'),
                        confirm: function () {
                            self.gui.show_screen('payment');
                        },
                    });
                }
            }
        },

        /**
         * Event handler after clicking on the customer button
         */
        clickSetCustomer: function () {
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_change_customer_id[0]) === -1) {
                this.gui.show_popup('error', {
                    'title': _t('Change Customer - Unauthorized function'),
                    'body':  _t('Please ask your manager to do it.'),
                });
            } else {
                // Copy past from /point_of_sale/static/src/js/screens.js#L465
                this.gui.show_screen('clientlist');
            }
        },
    });

    screens.ProductScreenWidget.include({

        /**
         * Start check access to create order line
         */
        start: function () {
            this._super();
            this.checkCreateOrderLine();
        },

        /**
         * Render Products list
         */
        renderElement: function () {
            this._super();
            this.pos.bind('change:cashier', this.checkCreateOrderLine, this);
        },

        /**
         * Block product list if user doesn't belong to the correct group
         */
        checkCreateOrderLine: function () {
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            if (user.groups_id.indexOf(this.pos.config.group_create_order_line_id[0]) === -1) {
                $('.rightpane').addClass('pos-disabled-mode');
            } else {
                $('.rightpane').removeClass('pos-disabled-mode');
            }
        },
    });

    screens.OrderWidget.include({

        /**
         * Change current orderline
         * @param {Object} line
         */
        orderline_change: function (line) {
            var user = this.pos.get('cashier') || this.pos.get_cashier();
            var numpad = this.getParent().numpad;
            if (numpad.disable_numpad || (line && line.quantity <= 0 && user.groups_id.indexOf(this.pos.config.group_delete_order_line_id[0]) === -1 && numpad.state.get('mode') === "quantity")) {
                $('.numpad-backspace').addClass('pos-disabled-mode');
            } else {
                $('.numpad-backspace').removeClass('pos-disabled-mode');
            }
            this._super(line);
        },

        /**
         * Block 'backspace' button if user doesn't belong to the correct group
         * @param {Boolean} scrollbottom
         */
        renderElement: function (scrollbottom) {
            this._super(scrollbottom);
            var order = this.pos.get_order();
            if (order) {
                var line = order.get_selected_orderline();
                var user = this.pos.get('cashier') || this.pos.get_cashier();
                var numpad = this.getParent().numpad;
                if (numpad.disable_numpad || (line && line.quantity <= 0 && user.groups_id.indexOf(this.pos.config.group_delete_order_line_id[0]) === -1 && numpad.state.get('mode') === "quantity")) {
                    $('.numpad-backspace').addClass('pos-disabled-mode');
                } else {
                    $('.numpad-backspace').removeClass('pos-disabled-mode');
                }
            }
        },
    });

    return {
        'models': models,
        'chrome': chrome,
        'screens': screens,
    };
});
