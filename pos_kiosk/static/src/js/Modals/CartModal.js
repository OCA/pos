odoo.define("pos_kiosk.CartModal", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    // Formerly ConfirmPopupWidget
    class CartModal extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.order = this.props.order;
            this.orderlines = this.order.orderlines.models;
        }

        getProductPrice(product) {
            return this.order.pos.format_currency(product.lst_price);
        }

        getTotalValue() {
            return this.order.pos.format_currency(this.order.get_total_with_tax());
        }

        getTotalItens() {
            let count = 0;
            for (let i = 0; i < this.orderlines.length; i++) {
                const element = this.orderlines[i];
                count += element.quantity;
            }
            return count;
        }

        removeQuantity(orderline) {
            if (orderline.quantity > 1) {
                orderline.set_quantity(orderline.quantity - 1);
            } else {
                this.order.remove_orderline(orderline);
            }

            if (this.order.paymentlines.length > 0) {
                this.order.paymentlines.models[0].set_amount(
                    this.order.get_total_with_tax()
                );
            }

            if (this.order.orderlines.length === 0) {
                this.trigger("close-popup");
            }
            this.render();
        }

        addQuantity(orderline) {
            orderline.set_quantity(orderline.quantity + 1);

            if (this.order.paymentlines.length > 0) {
                this.order.paymentlines.models[0].set_amount(
                    this.order.get_total_with_tax()
                );
            }

            this.render();
        }

        openPaymentScreen() {
            this.trigger("close-popup");
            this.order.screen_data = {current: "KioskPaymentScreen"};
            this.showScreen("KioskPaymentScreen");
        }

        checkCurrentScreen() {
            return !(
                this.env.pos.get_order().screen_data.current === "KioskPaymentScreen"
            );
        }

        productImageURL(product) {
            return `/web/image?model=product.product&field=image_128&id=${product.id}&write_date=${product.write_date}&unique=1`;
        }

        productName(orderline) {
            let full_name = orderline.product.display_name;
            if (this.description) {
                full_name += ` (${this.description})`;
            }
            return full_name;
        }
    }
    CartModal.template = "CartModal";
    CartModal.defaultProps = {};

    Registries.Component.add(CartModal);

    return CartModal;
});
