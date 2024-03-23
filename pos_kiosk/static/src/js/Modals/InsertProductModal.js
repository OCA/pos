odoo.define("pos_kiosk.InsertProductModal", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");

    // Formerly ConfirmPopupWidget
    class InsertProductModal extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.product = this.props.product;
        }

        get productName() {
            return this.product.display_name;
        }

        get productPrice() {
            return this.env.pos.format_currency(this.product.lst_price);
        }

        get productQuantity() {
            return this.props.productQuantity;
        }

        get productTotalPrice() {
            return this.env.pos.format_currency(
                this.product.lst_price * this.productQuantity
            );
        }

        get productImageURL() {
            const product = this.props.product;
            return `/web/image?model=product.product&field=image_1920&id=${product.id}&write_date=${product.write_date}&unique=1`;
        }

        addQuantity() {
            this.props.productQuantity++;
            this.render();
        }

        removeQuantity() {
            if (this.props.productQuantity > 1) {
                this.props.productQuantity--;
                this.render();
            }
        }

        async getPayload() {
            return {productQuantity: this.props.productQuantity};
        }
    }
    InsertProductModal.template = "InsertProductModal";
    InsertProductModal.defaultProps = {
        productQuantity: 1,
    };

    Registries.Component.add(InsertProductModal);

    return InsertProductModal;
});
