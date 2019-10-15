// Copyright (C) 2019 by Lambda IS <https://www.lambda-is.com/>

odoo.define('pos_cashier_login.main', function (require) {
    'use strict';

    var gui = require('point_of_sale.gui');
    var screens = require('point_of_sale.screens');
    var chrome = require('point_of_sale.chrome');
    var pos_models = require('point_of_sale.models');
    var SuperPosModel = pos_models.PosModel.prototype;

    pos_models.PosModel = pos_models.PosModel.extend({
        set_cashier: function(user){
            SuperPosModel.set_cashier.call(this, user);
            if (this.gui.screen_instances['products']) {
                this.gui.show_screen('products');
            }
        },
    });

    chrome.Chrome.include({
        build_widgets: function() {
            this._super();
            if (this.pos.config.require_cashier_login) {
                this.gui.set_startup_screen('cashier-login');
                this.gui.set_default_screen('cashier-login');
            }
        },
    });

    var CashierLoginScreenWidget = screens.ScreenWidget.extend({
        template: 'CashierLoginScreenWidget',

        // override all barcode actions other than
        // barcode_cashier_action to do nothing
        barcode_product_action: function(code){},
        barcode_client_action: function(code){},
        barcode_discount_action: function(code){},
    });

    gui.define_screen({name: 'cashier-login', widget: CashierLoginScreenWidget});
})
