/*
    POS Automatic Validation module for Odoo
    Copyright (C) 2017 Julius Network Solutions
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    @author: Mathieu VATEL
    The licence is in the file __manifest__.py
*/

odoo.define('pos_automatic_validation.pos_automatic_validation', function (require) {
    "use strict";
    var screens = require('point_of_sale.screens');
    var models = require('point_of_sale.models');
    var utils = require('web.utils');
    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;

    models.load_fields("account.journal", ['iface_automatic_validation']);

    models.Paymentline = models.Paymentline.extend({
        get_automatic_validation: function() {
            return this.cashregister.journal.iface_automatic_validation;
        },
    });

    screens.PaymentScreenWidget.include({
        show: function(){
            this._super();
            // this.$('.next').hide();
        },

        // click_paymentmethods: function(id) {
        //     var self = this;
        //     this._super.apply(this, arguments);
        //     var selected_line = this.pos.get_order().selected_paymentline;
        //     if (selected_line) {
        //         var auto_validation = selected_line.get_automatic_validation();
        //         if (auto_validation == false) {
        //             this.$('.next').show();
        //         } else {
        //             this.$('.next').show();
        //         }
        //     }
        // },

        render_paymentlines: function() {
            this._super();
            var self = this;
            this.setup_auto_validation_timer();
        },

        setup_auto_validation_timer: function() {
            var self = this;
            var order = this.pos.get_order();
            var selected_line = order.selected_paymentline;
            if (selected_line) {
                var auto_validation = selected_line.get_automatic_validation();
                if (!auto_validation) {
                    this.$('.next').show();
                    return;
                }
                this.$('.next').hide();
                if (this._check_auto_validation_timer) {
                    clearTimeout(this._check_auto_validation_timer);
                }
                this._check_auto_validation_timer = setTimeout(function() {
                    self.check_auto_validation();
                }, 1000);
            }
            else {
                this.$('.next').show();
            }
        },

        check_auto_validation: function() {
            var self = this;
            var order = this.pos.get_order();
            // if it's finalized, it means it was validated manually
            // during the timeout timer. We do this to avoid errors
            if (order.finalized) { return; }
            if (order.is_paid()) {
                self.validate_order();
            }
        },
    });

});
