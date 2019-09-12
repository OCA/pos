/*

# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

*/

odoo.define('pos_ticket_send_by_mail.receipt_screen_widget', function (require) {
    
    "use strict";
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var _t = core._t;

    screens.ReceiptScreenWidget.include({

        print_web: function() {
            var client = this.pos.get_client();
            var email_pos_receipt = client ? client.email_pos_receipt: false;
            var receipt_options = this.pos.config_settings ? this.pos.config_settings.receipt_options : false;
            if (receipt_options && receipt_options == '3' && email_pos_receipt) {
                console.log("Skip print receipt by web");
                return
            } else {
            console.log("1 print receipt by web");
                return this._super();
            }
        },

        print_xml: function() {
            var client = this.pos.get_client();
            var email_pos_receipt = client ? client.email_pos_receipt: false;
            var receipt_options = this.pos.config_settings ? this.pos.config_settings.receipt_options : false;
            if (receipt_options && receipt_options == '3' && email_pos_receipt) {
                console.log("Skip print receipt by web");
                return
            } else {
            console.log(" print receipt by web");
                return this._super();
            }
        },
    });
});
