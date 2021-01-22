odoo.define('pos_payment_method_adyen.popups', function (require) {
    "use strict";

    var PopupWidget = require('point_of_sale.popups');
    var gui = require('point_of_sale.gui');

    var AutomatedPaymentPopupWidget = PopupWidget.extend({
        template: 'AutomatedPaymentPopupWidget',
    });

    gui.define_popup({name:'automatedPayment', widget: AutomatedPaymentPopupWidget});

});
