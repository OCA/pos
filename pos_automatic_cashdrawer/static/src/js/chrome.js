/*
    POS Automatic Cashdrawer module for Odoo
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    The licence is in the file __manifest__.py
*/

odoo.define('pos_automatic_cashdrawer.chrome', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var framework = require('web.framework');

    var _t = core._t;

    chrome.Chrome.include({

        /*
            Extend init to display an open session balance message
            It will check if the session has an opening balance cashbox and
            if it doesn't, it will syncrhonize it as long as it's the same amount.
            If it's different, it will ask for a manager and offer to overwrite it
        */
        init: function () {
            var self = this;
            this._super.apply(this, arguments);
            this.ready.done(function () {
                if (self.pos.config.iface_automatic_cashdrawer && self.pos.config.cash_control) {
                    self.pos.check_opening_balance_missing().then(function (res) {
                        var missing = res['missing'];
                        var balance_start = res['balance_start'];
                        // It's not missing, do nothing
                        if (!missing) return;
                        // Get the inventory from cashdrawer
                        framework.blockUI();
                        $.when(
                            self.pos.proxy.automatic_cashdrawer_get_total_amount(),
                            self.pos.proxy.automatic_cashdrawer_get_inventory()
                        ).then(function (totals, inventory) {
                            // Check if the amount is different
                            if (totals.total != balance_start) {
                                // Check access rights
                                var user = self.pos.get_cashier();
                                if (user.groups_id.indexOf(self.pos.config.group_pos_automatic_cashlogy_config[0]) != -1) {
                                    self.gui.show_popup('confirm', {
                                        title: _t('The opening balance does not match'),
                                        body: 
                                            _t('The opening balance for this session does not match with the Cashdrawer Inventory.') + '\n' +
                                            _t('Do you want to overwrite it with the real amount?') + '\n\n' +
                                            _t('Cashdrawer Inventory: ') + self.format_currency(totals.total) + '\n' +
                                            _t('Session Starting Balance: ') + self.format_currency(balance_start),
                                        confirm: function () {
                                            framework.blockUI();
                                            self.pos.action_set_balance(inventory.total, 'start')
                                            .always(function () { 
                                                framework.unblockUI(); 
                                            });
                                        }
                                    });
                                // If user does not have enough access rights, we block the POS
                                } else {
                                    self.gui.show_popup('error', {
                                        title: _t('The opening balance does not match'),
                                        body:
                                            _t('The opening balance for this session does not match with the Cashdrawer Inventory.') + '\n' +
                                            _t('Please ask your manager to fix it.')
                                    });
                                }
                            // If inventory matchs, we still need to syncronize it
                            // But we do it without asking
                            } else {
                                framework.blockUI();
                                self.pos.action_set_balance(inventory.total, 'start')
                                .always(function () { framework.unblockUI(); });
                            }
                        }).fail(function (error) {
                            self.gui.show_popup('error', {
                                title: _t('Unable to syncronize inventory'),
                                body: _t('Check that the Cashdrawer is online before starting the session, and refresh the browser.\n\n') + error.data.message,
                            });
                        }).always(function () {
                            framework.unblockUI();
                        });
                    });
                }
            });
        },

    });


    gui.Gui.include({

        /*
            Overload close so that we can synchronize the closing balance
        */
        close: function () {
            var self = this;
            var args = arguments;
            var _super = this._super;

            if (!this.pos.config.iface_automatic_cashdrawer) {
                return this._super.apply(this, arguments);
            }

            self.chrome.loading_show();
            self.chrome.loading_message(_t('Synchronizing automatic cashdrawer inventory'));
            self.pos.proxy.automatic_cashdrawer_get_inventory()
            .then(function (inventory) {
                self.pos.action_set_balance(inventory.total, 'end').then(function () {
                    _super.apply(self, args);
                });
            })
            .fail(function () {
                _super.apply(self, args);
            })
            .always(function () {
                self.chrome.loading_hide();
            });
        },

    });

    return {
        chrome: chrome.Chrome,
        gui: gui.Gui,
    };
});
