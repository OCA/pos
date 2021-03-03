odoo.define('pos_self_service_base.screens', function (require) {
    "use strict";
    // This file contains the base screen where user actions will be included.
    // Those actions will be defined in seperated modules.
    // e.g.: `pos_self_service_printing` defines UI and business logic for printing labels,

    var chrome = require('point_of_sale.chrome');
    var gui = require('point_of_sale.gui');
    var screens = require('point_of_sale.screens');

    /* -------- The Self-Service Screen  -------- */

    var SelfServiceScreenWidget = screens.ScreenWidget.extend({
        template: 'SelfServiceScreenWidget',

        // Ignore products, discounts, and client barcodes
        barcode_product_action: function(code){},
        barcode_discount_action: function(code){},
        barcode_client_action: function(code){},

        show: function(){
            this._super();
            this.chrome.widget.order_selector.hide();
        },
    });

    // Add the self-service screen to the GUI
    gui.define_screen({
        'name': 'selfservice',
        'widget': SelfServiceScreenWidget,
        'condition': function(){
            return this.pos.config.iface_self_service;
        },
    });

    // set the self-service screen as both the startup and default screen
    chrome.Chrome.include({
        build_widgets: function(){
            this._super();
            if (this.pos.config.iface_self_service) {
                this.gui.set_startup_screen('selfservice');
                this.gui.set_default_screen('selfservice');
            }
        },
    });
});
