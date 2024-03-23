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
            this.categoriesList = Object.values(this.env.pos.db.category_by_id).filter(
                (category) => category.parent_id === false
            );
            this.mainProductList = Object.values(this.env.pos.db.product_by_id);
            this.subCategoriesList = [];
        }

        setCategory(event) {
            const categoryID = event.detail;
            this.env.pos.set("selectedCategoryId", categoryID);

            const category = this.env.pos.db.get_category_by_id(categoryID);
            if (!category) return;

            const subCategories = Object.values(this.env.pos.db.category_by_id).filter(
                (element) => {
                    return element.parent_id && element.parent_id[0] === categoryID;
                }
            );

            this.subCategoriesList = subCategories.map((element) => {
                const productList = this.mainProductList.filter(
                    (product) => product.pos_categ_id[0] === element.id
                );
                return {
                    id: element.id,
                    name: element.name,
                    productList: productList,
                };
            });

            this.render();
        }

        getCategoryName() {
            const categoryID = this.env.pos.get("selectedCategoryId");
            if (!categoryID) return;
            const category = this.env.pos.db.get_category_by_id(categoryID);
            return category.name;
        }

        getProductName(product_id) {
            const product = this.subCategoriesList.find((element) =>
                element.productList.some((product) => product.id === product_id)
            );

            return product
                ? product.productList.find((product) => product.id === product_id)
                      .display_name
                : null;
        }

        getProductPrice(product_id) {
            const product = this.subCategoriesList.find((element) =>
                element.productList.some((product) => product.id === product_id)
            );

            if (product) {
                const targetProduct = product.productList.find(
                    (product) => product.id === product_id
                );
                return this.env.pos.format_currency(targetProduct.lst_price);
            }

            return null;
        }

        productImageURL(product_id) {
            const {id, write_date} = this.env.pos.db.product_by_id[product_id];
            return `/web/image?model=product.product&field=image_1920&id=${id}&write_date=${write_date}&unique=1`;
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

            if (!confirm) return {confirm};

            const options = {
                quantity: payload.productQuantity || 1,
                price_extra: payload.priceExtra || 0.0,
                description: payload.selectedAttributes
                    ? payload.selectedAttributes.join(", ")
                    : "",
            };

            return {confirm, payload: options};
        }

        hasAttributes(product) {
            return product.attribute_line_ids.some(
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
            return product.attribute_line_ids
                .map((id) => this.env.pos.attributes_by_ptal_id[id])
                .filter((attr) => attr !== undefined);
        }

        haveProduct() {
            return true ? this.env.pos.get_order().orderlines.length > 0 : false;
        }
    }

    KioskProductScreen.template = "KioskProductScreen";

    Registries.Component.add(KioskProductScreen);

    return KioskProductScreen;
});
