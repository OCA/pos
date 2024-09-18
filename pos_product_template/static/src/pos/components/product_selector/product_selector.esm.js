/** @odoo-module */
/* Copyright (C) 2024-Today Dixmit (https://www.dixmit.com)
    @author Enric Tobella (https://www.dixmit.com)
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {
    ColorProductAttribute,
    MultiProductAttribute,
    PillsProductAttribute,
    RadioProductAttribute,
    SelectProductAttribute,
} from "@point_of_sale/app/store/product_configurator_popup/product_configurator_popup";
import {useState, useSubEnv} from "@odoo/owl";

import {AbstractAwaitablePopup} from "@point_of_sale/app/popup/abstract_awaitable_popup";
import {ProductCard} from "@point_of_sale/app/generic_components/product_card/product_card";
import {ProductInfoPopup} from "@point_of_sale/app/screens/product_screen/product_info_popup/product_info_popup";
import {_t} from "@web/core/l10n/translation";
import {usePos} from "@point_of_sale/app/store/pos_hook";
import {useService} from "@web/core/utils/hooks";

export class ProductSelector extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.pos = usePos();
        useSubEnv({attribute_components: []});
        this.popup = useService("popup");
        this.ui = useService("ui");
        this.notification = useService("pos_notification");
        this.state = useState({});
    }
    get products() {
        return this.pos.db.get_product_by_template(this.props.productTmplId);
    }
    async onClickProduct(product) {
        await this.pos.addProductToCurrentOrder(product);
        this.confirm();
    }
    async onProductInfoClick(product) {
        const info = await this.pos.getProductInfo(product, 1);
        this.popup.add(ProductInfoPopup, {info: info, product: product});
    }
    getPayload() {
        const attribute_custom_values = [];
        let attribute_value_ids = [];

        this.env.attribute_components.forEach((attribute_component) => {
            const {valueIds, custom_value} = attribute_component.getValue();
            attribute_value_ids.push(valueIds);

            if (custom_value) {
                // For custom values, it will never be a multiple attribute
                attribute_custom_values[valueIds[0]] = custom_value;
            }
        });

        attribute_value_ids = attribute_value_ids.flat();
        return {
            attribute_value_ids,
            attribute_custom_values,
        };
    }
    get attributes() {
        return this.props.product.attribute_line_ids
            .map((id) => this.pos.product_attribute[id])
            .filter((attr) => attr !== undefined);
    }
    onClickConfirm() {
        var attribute = JSON.stringify(this.getPayload().attribute_value_ids.sort());
        var product = this.products.filter(
            (p) =>
                JSON.stringify(p.product_template_attribute_value_ids.sort()) ===
                attribute
        );
        if (product.length === 1) {
            this.onClickProduct(product[0]);
            return;
        }
        this.notification.add(_t("Selected product couldn't be found"));
    }
}
ProductSelector.template = "pos_product_template.ProductSelector";
ProductSelector.defaultProps = {
    confirmText: _t("Ok"),
    cancelKey: false,
    body: "",
};
ProductSelector.components = {
    ...AbstractAwaitablePopup.components,
    ProductCard,
    RadioProductAttribute,
    PillsProductAttribute,
    SelectProductAttribute,
    ColorProductAttribute,
    MultiProductAttribute,
};
