/* Copyright 2019 Solvos Consultoría Informática
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_ticket_without_price.screens', function (require) {
    "use strict";

    var core = require('web.core');
    var screens = require('point_of_sale.screens');

    var QWeb = core.qweb;

    screens.ReceiptScreenWidget.include({

        renderElement: function() {
            var self = this;
            this._super();

            var button_print_click_handler = $._data(
                this.$el.find('.button.print')[0], 'events').click[0].handler;
            var button_print = this.$('.button.print');
            button_print.off('click');
            button_print.click(function(){
                self.render_receipt();
                button_print_click_handler();
            });

            var button_print_ticket_without_price =
                this.$('.button.print_ticket_without_price');
            button_print_ticket_without_price.click(function () {
                self.render_ticket_without_price();
                self.print();
            });

        },

        render_ticket_without_price: function() {
            this.$('.pos-receipt-container').html(
                QWeb.render('PosTicketWithoutPrice',
                    this.get_receipt_render_env()));
        },

    });

});
