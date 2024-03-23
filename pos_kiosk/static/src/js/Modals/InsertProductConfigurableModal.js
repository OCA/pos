odoo.define("pos_kiosk.InsertProductConfigurableModal", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {useState} = owl.hooks;

    class InsertProductConfigurableModal extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.product = this.props.product;
            this.attributes = this.props.attributes;
            this.state = {
                selected_value: 0,
            };
        }

        async confirm() {
            if (this.checkSelectedAttribute()) {
                super.confirm();
            }
        }

        checkSelectedAttribute() {
            var selected = false;
            this.attributes.forEach((attribute) => {
                attribute.values.forEach((value) => {
                    if (value.id === parseFloat(this.state.selected_value)) {
                        selected = true;
                    }
                });
            });
            return selected;
        }

        getPayload() {
            var selected_attributes = [];
            var price_extra = 0.0;

            this.attributes.forEach((attribute) => {
                attribute.values.forEach((value) => {
                    if (value.id === parseFloat(this.state.selected_value)) {
                        selected_attributes.push(value.name);
                        price_extra += value.price_extra;
                    }
                });
            });

            return {
                productQuantity: this.props.productQuantity,
                selectedAttributes: selected_attributes,
                priceExtra: price_extra,
            };
        }

        get productQuantity() {
            return this.props.productQuantity;
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

        get productName() {
            return this.product.display_name;
        }

        get productPrice() {
            return this.env.pos.format_currency(this.product.lst_price);
        }

        get productImageURL() {
            const product = this.props.product;
            return `/web/image?model=product.product&field=image_1920&id=${product.id}&write_date=${product.write_date}&unique=1`;
        }
    }
    InsertProductConfigurableModal.template = "InsertProductConfigurableModal";
    InsertProductConfigurableModal.defaultProps = {
        productQuantity: 1,
    };

    Registries.Component.add(InsertProductConfigurableModal);

    return InsertProductConfigurableModal;
});
