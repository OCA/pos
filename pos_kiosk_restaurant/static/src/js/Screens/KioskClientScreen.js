odoo.define("pos_kiosk_restaurant.KioskClientScreen", function (require) {
  "use strict";

  const KioskClientScreen = require("pos_kiosk.KioskClientScreen");
  const Registries = require('point_of_sale.Registries');

  const KioskClientScreenRestaurant = KioskClientScreen => class extends KioskClientScreen {
    async finalizeOrder() {
      // await this.order.printChanges();
      await super.finalizeOrder();
    }
  }

  Registries.Component.extend(KioskClientScreen, KioskClientScreenRestaurant);

  return KioskClientScreenRestaurant;
})