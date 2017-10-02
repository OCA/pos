/******************************************************************************
 * Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 ******************************************************************************/

odoo.define('pos_default_invoice_active.activate_invoicing', function (require) {
    "use strict";

  var pos_models = require('point_of_sale.models');
  var pos_screens = require('point_of_sale.screens');

  // add `iface_invoicing_active` to loaded pos config's fields
  pos_models.load_fields("pos.config", "iface_invoicing_active");

  pos_screens.PaymentScreenWidget.include({
    show: function(){
      this._super();
      // activate invoicing
      // TODO: any better way to check if the button is already enabled?
      if (this.pos.config.iface_invoicing_active && !this.$('.js_invoice').hasClass('highlight')) {
        this.$('.js_invoice').trigger('click');
      }
    },
  });

});
