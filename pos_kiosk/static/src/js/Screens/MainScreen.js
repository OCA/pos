odoo.define("pos_kiosk.MainScreen", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const {useListener} = require("web.custom_hooks");

    class MainScreen extends PosComponent {
        constructor() {
            super(...arguments);

            this.category_id = false;
            this.categories = [];
            this.sub_categories = [];
            this.product_list = [];

            for (const key in this.env.pos.db.category_by_id) {
                if (this.env.pos.db.category_by_id.hasOwnProperty(key)) {
                    const value = this.env.pos.db.category_by_id[key];
                    if (value.parent_id === false) {
                        this.categories.push(value);
                    }
                }
            }

            for (const key in this.env.pos.db.product_by_id) {
                if (this.env.pos.db.product_by_id.hasOwnProperty(key)) {
                    const value = this.env.pos.db.product_by_id[key];
                    this.product_list.push(value);
                }
            }
        }

        setCategory(category_id) {
            // Const category = this.env.pos.db.category_by_id[category_id];

            this.category_id = category_id;
            this.env.pos.set("selectedCategoryId", category_id);
            this.sub_categories = [];

            for (const key in this.env.pos.db.category_by_id) {
                this.product_list = [];
                if (this.env.pos.db.category_by_id.hasOwnProperty(key)) {
                    const sub_category_id = this.env.pos.db.category_by_id[key];
                    if (
                        sub_category_id.parent_id &&
                        sub_category_id.parent_id[0] === category_id
                    ) {
                        for (const key in this.env.pos.db.product_by_id) {
                            if (this.env.pos.db.product_by_id.hasOwnProperty(key)) {
                                const value = this.env.pos.db.product_by_id[key];
                                if (value.pos_categ_id[0] === sub_category_id.id) {
                                    this.product_list.push(value);
                                }
                            }
                        }
                        this.sub_categories.push({
                            id: sub_category_id.id,
                            name: sub_category_id.name,
                            productList: this.product_list,
                        });
                    }
                }
            }
            this.render();
        }

        getProductName(product_id) {
            for (let i = 0; i < this.sub_categories.length; i++) {
                const element = this.sub_categories[i];
                for (let j = 0; j < element.productList.length; j++) {
                    const product = element.productList[j];
                    if (product.id === product_id) return product.display_name;
                }
            }
        }

        getProductPrice(product_id) {
            for (let i = 0; i < this.sub_categories.length; i++) {
                const element = this.sub_categories[i];
                for (let j = 0; j < element.productList.length; j++) {
                    const product = element.productList[j];
                    if (product.id === product_id)
                        return this.env.pos.format_currency(product.lst_price);
                }
            }
        }

        productImageURL(product_id) {
            const product = this.env.pos.db.product_by_id[product_id];
            return `/web/image?model=product.product&field=image_1920&id=${product.id}&write_date=${product.write_date}&unique=1`;
        }

        get topBannerLogo() {
            const pos_config = this.env.pos.config;
            return `/web/image?model=pos.config&field=top_banner_image&id=${pos_config.id}&write_date=${pos_config.write_date}&unique=1`;
        }

        async addProduct(product_id) {
            const product = this.env.pos.db.product_by_id[product_id];
            const options = await this.getOptions(product);

            if (!options.confirm) return;

            this.env.pos.get_order().add_product(product, options.payload);
            this.render();
        }

        async getOptions(product) {
            let confirm = false;
            let payload = {};
            let options = {};

            if (
                this.env.pos.config.product_configurator &&
                this.hasAttributes(product)
            ) {
                const {
                    confirmed,
                    payload: attrPayload,
                } = await this.showConfigurableProductPopup(product);
                confirm = confirmed;
                payload = attrPayload;
            } else {
                const {
                    confirmed,
                    payload: prodPayload,
                } = await this.showRegularProductPopup(product);
                confirm = confirmed;
                payload = prodPayload;
            }

            if (payload) {
                options = {
                    quantity: payload.productQuantity || 1,
                    price_extra: payload.priceExtra || 0.0,
                    description: payload.selectedAttributes
                        ? payload.selectedAttributes.join(", ")
                        : "",
                };
            }

            return {confirm: confirm, payload: options};
        }

        hasAttributes(product) {
            return _.some(
                product.attribute_line_ids,
                (id) => id in this.env.pos.attributes_by_ptal_id
            );
        }

        async showConfigurableProductPopup(product) {
            const attributes = this.getAttributeList(product);
            return this.showPopup("InsertProductConfigurableModal", {
                product,
                attributes,
            });
        }

        async showRegularProductPopup(product) {
            return this.showPopup("InsertProductModal", {
                product,
            });
        }

        getAttributeList(product) {
            return _.map(
                product.attribute_line_ids,
                (id) => this.env.pos.attributes_by_ptal_id[id]
            ).filter((attr) => attr !== undefined);
        }

        haveProduct() {
            return true ? this.env.pos.get_order().orderlines.length > 0 : false;
        }

        getTotalItems() {
            let count = 0;
            for (let i = 0; i < this.env.pos.get_order().orderlines.length; i++) {
                const element = this.env.pos.get_order().orderlines.models[i];
                count += element.quantity;
            }
            return count;
        }

        getTotalValue() {
            let count = 0;
            for (let i = 0; i < this.env.pos.get_order().orderlines.length; i++) {
                const element = this.env.pos.get_order().orderlines.models[i];
                count += element.get_price_with_tax();
            }
            return this.env.pos.format_currency(count);
        }

        openCart() {
            if (this.haveProduct()) {
                this.env.pos.get_order().screen_data = {current: "MainScreen"};
                this.showPopup("CartModal", {
                    order: this.env.pos.get_order(),
                });
            }
        }

        openPaymentScreen() {
            if (this.haveProduct()) {
                this.env.pos.get_order().screen_data = {current: "KioskPaymentScreen"};
                this.showScreen("KioskPaymentScreen");
            }
        }

        get selectedCategoryId() {
            return this.env.pos.get("selectedCategoryId");
        }
    }

    MainScreen.template = "MainScreen";

    Registries.Component.add(MainScreen);

    return MainScreen;
});
