odoo.define('pos_payment_method_adyen.models', function (require) {
    var models = require('point_of_sale.models');

    models.load_fields('account.journal', ['adyen_test_mode', 'adyen_api_key', 'adyen_show_receipt_poi', 'adyen_merchant_account']);
    models.load_fields('res.partner', ['pos_adyen_shopper_reference', 'pos_adyen_payment_token', 'pos_adyen_card_details']);

    var order_super = models.Order.prototype;

    models.Order = models.Order.extend({
        export_as_JSON: function () {
            var res = order_super.export_as_JSON.apply(this, arguments);
            res.customer_card_alias = this.customer_card_alias;
            res.customer_card_country_code = this.customer_card_country_code;
            res.customer_card_country_iso = this.customer_card_country_iso;
            res.customer_card_funding_source = this.customer_card_funding_source;
            return res;
        },
        export_for_printing: function () {
            var res = order_super.export_for_printing.apply(this, arguments);
            res.customer_card_alias = this.customer_card_alias;
            res.customer_card_country_code = this.customer_card_country_code;
            res.customer_card_country_iso = this.customer_card_country_iso;
            res.customer_card_funding_source = this.customer_card_funding_source;
            return res;
        },
    })

});
