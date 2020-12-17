odoo.define('pos_payment_method_adyen.models', function (require) {
    var models = require('point_of_sale.models');

    models.load_fields('account.journal', ['adyen_terminal_identifier', 'adyen_test_mode', 'adyen_api_key', 'adyen_show_receipt_poi']);
    models.load_fields('res.partner', ['pos_payment_token']);

});
