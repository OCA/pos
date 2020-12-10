/*
    POS Payment Terminal Return module for Odoo
    Copyright (C) 2016-Today Julius Network Solutions
    @author: Mathieu Vatel <mathieu@julius.fr>
    Copyright (C) 2020-Today: Druidoo (<https://www.druidoo.io>)
    The licence is in the file __manifest__.py
*/

odoo.define('pos_payment_terminal_return.pos_payment_terminal_return', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    models.load_fields("account.journal", ['pos_terminal_payment_mode']);

    models.Paymentline = models.Paymentline.extend({
        wait_terminal_return: function () {
            if (this.cashregister.journal.pos_terminal_payment_mode === 'card' && this.pos.config.iface_payment_terminal && this.pos.config.iface_payment_terminal_return) {
                return true;
            }
            return false;
        },
    });

    models.Order = models.Order.extend({
        add_paymentline: function (cashregister) {
            this.assert_editable();
            var newPaymentline = new models.Paymentline({}, {order: this, cashregister:cashregister, pos:this.pos});
            var wait_terminal_return = newPaymentline.wait_terminal_return();
            if ((cashregister.journal.type !== 'cash' || this.pos.config.iface_precompute_cash) && !wait_terminal_return) {
                newPaymentline.set_amount( Math.max(this.get_due(), 0) );
            }
            this.paymentlines.add(newPaymentline);
            this.select_paymentline(newPaymentline);
        },
    });

});
