/** @odoo-module **/
import {Orderline} from "@point_of_sale/app/store/models";
import {ProductInfoPopup} from "@point_of_sale/app/screens/product_screen/product_info_popup/product_info_popup";
import {patch} from "@web/core/utils/patch";

patch(Orderline.prototype, {
    async onProductInfoClick() {
        const product = this.product;
        const info = await this.pos.getProductInfo(product, 1);
        this.env.services.popup.add(ProductInfoPopup, {info: info, product: product});
    },
});
