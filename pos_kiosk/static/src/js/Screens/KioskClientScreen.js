odoo.define("pos_kiosk.KioskClientScreen", function (require) {
  "use strict";
  const PosComponent = require("point_of_sale.PosComponent");
  const Registries = require("point_of_sale.Registries");

  class KioskClientScreen extends PosComponent {
      constructor() {
          super(...arguments);
          this.order = this.env.pos.get_order();
      }

      get currentOrder() {
        return this.env.pos.get_order();
      }

      async finalizeOrder() {
        const currentOrder = this.order;

        if (!currentOrder.client_name) {
            return;
        }

        currentOrder.initialize_validation_date();
        currentOrder.finalized = true;

        let syncedOrderBackendIds = [];

        try {
            syncedOrderBackendIds = await this.env.pos.push_single_order(
                currentOrder
            );
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(error.message);
            }
        }
        
        this.showScreen("KioskReceiptScreen");
    }

    changeName(event) {
      this.currentOrder.client_name = event.target.value;
      this.render();
    }

    changeVat(event) {
      this.currentOrder.vat = event.target.value;
    }

    backScreen() {
      this.showScreen("KioskPaymentScreen");
    }

    hasClientName() {
      return this.currentOrder.client_name !== '';
    }

    get topBannerLogo() {
      const pos_config = this.env.pos.config;
      return `/web/image?model=pos.config&field=top_banner_image&id=${pos_config.id}&write_date=${pos_config.write_date}&unique=1`
    }
  }

  KioskClientScreen.template = "KioskClientScreen";

  Registries.Component.add(KioskClientScreen);

  return KioskClientScreen;
});
