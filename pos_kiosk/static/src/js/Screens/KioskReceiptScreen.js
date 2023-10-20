odoo.define('pos_kiosk.KioskReceiptScreen', function (require) {
  'use strict';

  const { Printer } = require('point_of_sale.Printer');
  const { is_email } = require('web.utils');
  const { useRef, useContext } = owl.hooks;
  const { useErrorHandlers, onChangeOrder } = require('point_of_sale.custom_hooks');
  const Registries = require('point_of_sale.Registries');
  const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');

  const KioskReceiptScreen = (AbstractReceiptScreen) => {
      class KioskReceiptScreen extends AbstractReceiptScreen {
          constructor() {
              super(...arguments);
              useErrorHandlers();
              onChangeOrder(null, (newOrder) => newOrder && this.render());
              this.orderReceipt = useRef('order-receipt');
          }
          mounted() {
              // Here, we send a task to the event loop that handles
              // the printing of the receipt when the component is mounted.
              // We are doing this because we want the receipt screen to be
              // displayed regardless of what happen to the handleAutoPrint
              // call.
              setTimeout(async () => await this.handleAutoPrint(), 0);
          }
          get currentOrder() {
              return this.env.pos.get_order();
          }
          /**
           * This function is called outside the rendering call stack. This way,
           * we don't block the displaying of ReceiptScreen when it is mounted; additionally,
           * any error that can happen during the printing does not affect the rendering.
           */
          async handleAutoPrint() {
              if (this._shouldAutoPrint()) {
                  const currentOrder = this.currentOrder;
                  await this.printReceipt();
              }
          }
          _shouldAutoPrint() {
            return this.env.pos.config.iface_print_auto && !this.currentOrder._printed;
        }
          async printReceipt() {
              const currentOrder = this.currentOrder;
              const isPrinted = await this._printReceipt();
              if (isPrinted) {
                  currentOrder._printed = true;
              }
          }

          makeOtherOrder() {
            this.env.pos.get_order().destroy();
            this.env.pos.set('selectedCategoryId', false);
            this.showScreen("KioskProductScreen");
        }

        endedSession() {
            this.env.pos.get_order().destroy();
            this.env.pos.set('selectedCategoryId', false);
            this.showScreen("WelcomeScreen");
        }

        get topBannerLogo() {
            const pos_config = this.env.pos.config;
            return `/web/image?model=pos.config&field=top_banner_image&id=${pos_config.id}&write_date=${pos_config.write_date}&unique=1`
        }
        
        get currentOrder() {
            return this.env.pos.get_order();
        }
      }
      KioskReceiptScreen.template = 'KioskReceiptScreen';
      return KioskReceiptScreen;
  };

  Registries.Component.addByExtending(KioskReceiptScreen, AbstractReceiptScreen);

  return KioskReceiptScreen;
});
