odoo.define("pos_kiosk.KioskProductScreen", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("web.custom_hooks");

    class KioskProductScreen extends PosComponent {
        constructor() {
            super(...arguments);
            useListener("switch-category", this.setCategory);
            this.env.pos.set("selectedCategoryId", false);
            this.categoriesList = Object.values(this.env.pos.db.category_by_id).filter(category => category.parent_id === false);
            // this.productList = Object.values(this.env.pos.db.product_by_id);
            // this.subCategoriesList = [];
        }

        setCategory(event) {
            this.env.pos.set("selectedCategoryId", event.detail);
            this.render();
        }

        getCategoryName() {
            const categoryID = this.env.pos.get("selectedCategoryId");
            if (!categoryID) return;
            const category = this.env.pos.db.get_category_by_id(categoryID);
            return category.name;
        }

        // getProductName(product_id) {
        //     for (let i = 0; i < this.subCategoriesList.length; i++) {
        //         const element = this.subCategoriesList[i];
        //         for (let j = 0; j < element.productList.length; j++) {
        //             const product = element.productList[j];
        //             if (product.id === product_id) return product.display_name;
        //         }
        //     }
        // }

        // getProductPrice(product_id) {
        //     for (let i = 0; i < this.subCategoriesList.length; i++) {
        //         const element = this.subCategoriesList[i];
        //         for (let j = 0; j < element.productList.length; j++) {
        //             const product = element.productList[j];
        //             if (product.id === product_id)
        //                 return this.env.pos.format_currency(product.lst_price);
        //         }
        //     }
        // }

        // productImageURL(product_id) {
        //     const product = this.env.pos.db.product_by_id[product_id];
        //     return `/web/image?model=product.product&field=image_1920&id=${product.id}&write_date=${product.write_date}&unique=1`;
        // }

        // async addProduct(product_id) {
        //     const product = this.env.pos.db.product_by_id[product_id];
        //     const options = await this.getOptions(product);

        //     if (!options.confirm) return;

        //     this.env.pos.get_order().add_product(product, options.payload);
        //     this.render();
        // }

        // async getOptions(product) {
        //     let confirm = false;
        //     let payload = {};
        //     let options = {};

        //     if (
        //         this.env.pos.config.product_configurator &&
        //         this.hasAttributes(product)
        //     ) {
        //         const {
        //             confirmed,
        //             payload: attrPayload,
        //         } = await this.showConfigurableProductPopup(product);
        //         confirm = confirmed;
        //         payload = attrPayload;
        //     } else {
        //         const {
        //             confirmed,
        //             payload: prodPayload,
        //         } = await this.showRegularProductPopup(product);
        //         confirm = confirmed;
        //         payload = prodPayload;
        //     }

        //     if (payload) {
        //         options = {
        //             quantity: payload.productQuantity || 1,
        //             price_extra: payload.priceExtra || 0.0,
        //             description: payload.selectedAttributes
        //                 ? payload.selectedAttributes.join(", ")
        //                 : "",
        //         };
        //     }

        //     return {confirm: confirm, payload: options};
        // }

        // hasAttributes(product) {
        //     return _.some(
        //         product.attribute_line_ids,
        //         (id) => id in this.env.pos.attributes_by_ptal_id
        //     );
        // }

        // async showConfigurableProductPopup(product) {
        //     const attributes = this.getAttributeList(product);
        //     return this.showPopup("InsertProductConfigurableModal", {
        //         product,
        //         attributes,
        //     });
        // }

        // async showRegularProductPopup(product) {
        //     return this.showPopup("InsertProductModal", {
        //         product,
        //     });
        // }

        // getAttributeList(product) {
        //     return _.map(
        //         product.attribute_line_ids,
        //         (id) => this.env.pos.attributes_by_ptal_id[id]
        //     ).filter((attr) => attr !== undefined);
        // }

        // haveProduct() {
        //     return true ? this.env.pos.get_order().orderlines.length > 0 : false;
        // }

        // getTotalItems() {
        //     let count = 0;
        //     for (let i = 0; i < this.env.pos.get_order().orderlines.length; i++) {
        //         const element = this.env.pos.get_order().orderlines.models[i];
        //         count += element.quantity;
        //     }
        //     return count;
        // }

        // getTotalValue() {
        //     let count = 0;
        //     for (let i = 0; i < this.env.pos.get_order().orderlines.length; i++) {
        //         const element = this.env.pos.get_order().orderlines.models[i];
        //         count += element.get_price_with_tax();
        //     }
        //     return this.env.pos.format_currency(count);
        // }

        // openCart() {
        //     if (this.haveProduct()) {
        //         this.env.pos.get_order().screen_data = {current: "KioskProductScreen"};
        //         this.showPopup("CartModal", {
        //             order: this.env.pos.get_order(),
        //         });
        //     }
        // }

        // openPaymentScreen() {
        //     if (this.haveProduct()) {
        //         this.env.pos.get_order().screen_data = {current: "KioskPaymentScreen"};
        //         this.showScreen("KioskPaymentScreen");
        //     }
        // }
    }

    KioskProductScreen.template = "KioskProductScreen";

    Registries.Component.add(KioskProductScreen);

    return KioskProductScreen;
});
