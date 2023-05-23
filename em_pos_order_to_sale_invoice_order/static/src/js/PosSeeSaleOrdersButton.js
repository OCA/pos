odoo.define('pos_order_to_sale_order.PosSeeSaleOrdersButton', function(require) {
'use strict';
  const PosComponent = require('point_of_sale.PosComponent');
  const { useListener } = require("@web/core/utils/hooks");
  const Registries = require('point_of_sale.Registries');

  // extend PosComponent for adding the button.
  class PosSeeSaleOrdersButton extends PosComponent {
      setup() {
          super.setup();
          useListener('click', this.onClick);
      }
      // extend PosComponent for adding the button for sync all orders.
      //onclick function of syn all button
      async onClick() {
          window.open("/web#model=sale.order");
      }
  }
  PosSeeSaleOrdersButton.template = 'PosSeeSaleOrdersButton';
  Registries.Component.add(PosSeeSaleOrdersButton);
  return PosSeeSaleOrdersButton;
});

