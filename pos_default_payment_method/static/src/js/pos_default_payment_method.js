/******************************************************************************
 * Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 ******************************************************************************/

odoo.define('pos_default_payment_method.activate_payment', function (require) {
    "use strict";

  var pos_models = require('point_of_sale.models');
  var pos_screens = require('point_of_sale.screens');

  // add `default_payment_method_id` to loaded pos config's fields
  pos_models.load_fields("pos.config", "default_payment_method_id");

  pos_screens.PaymentScreenWidget.include({
    show: function(){
      this._super();
      // activate default payment method if any
      if (this.pos.config.default_payment_method_id) {
        this.click_paymentmethods(this.pos.config.default_payment_method_id[0]);
      }
    },
  });

});
