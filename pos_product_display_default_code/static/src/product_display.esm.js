import {PosOrderline} from "@point_of_sale/app/models/pos_order_line";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {patch} from "@web/core/utils/patch";

patch(ProductScreen.prototype, {
    getProductName(product) {
        if (this.pos?.config?.display_default_code && product?.display_name) {
            return product.display_name;
        }
        return super.getProductName(product);
    },
});

patch(PosOrderline.prototype, {
    get orderDisplayProductName() {
        const res = super.orderDisplayProductName;
        if (this.config?.display_default_code && this.product_id?.display_name) {
            return {...res, name: this.product_id.display_name};
        }
        return res;
    },

    setFullProductName() {
        super.setFullProductName();
        if (this.config?.display_default_code && this.product_id?.display_name) {
            this.full_product_name = this.product_id.display_name;
        }
    },
});
