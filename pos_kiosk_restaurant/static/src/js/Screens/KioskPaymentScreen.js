odoo.define("pos_kiosk_restaurant.KioskPaymentScreen", function (require) {
  "use strict";

  const KioskPaymentScreen = require("pos_kiosk.KioskPaymentScreen");
  const Registries = require('point_of_sale.Registries');

  const KioskPaymentScreenRestaurant = KioskPaymentScreen => class extends KioskPaymentScreen {
    async finalizeOrder() {
      await this.order.printChanges();
      await super.finalizeOrder();
    }
  }

  Registries.Component.extend(KioskPaymentScreen, KioskPaymentScreenRestaurant);

  return KioskPaymentScreenRestaurant;
})