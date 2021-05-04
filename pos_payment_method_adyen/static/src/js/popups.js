odoo.define('pos_payment_method_adyen.popups', function (require) {
    "use strict";

    var PopupWidget = require('point_of_sale.popups');
    var gui = require('point_of_sale.gui');

    var AutomatedPaymentPopupWidget = PopupWidget.extend({
        template: 'AutomatedPaymentPopupWidget',
        events: _.extend({}, PopupWidget.prototype.events, {
            'click .cancel-remove': 'cancel_remove',
        }),
    });

    gui.define_popup({name:'automatedPayment', widget: AutomatedPaymentPopupWidget});

});
