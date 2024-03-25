/** @odoo-module **/

import ProductsWidgetControlPanel from "point_of_sale.ProductsWidgetControlPanel";
import Registries from "point_of_sale.Registries";

export const PosProductsWidgetControlPanel = (ProductsWidgetControlPanelOriginal) =>
    class extends ProductsWidgetControlPanelOriginal {
        _toggleMobileSearchbar() {
            if (this.searchWordInput.el && this.searchWordInput.el.value.trim()) {
                return;
            }
            super._toggleMobileSearchbar();
        }
    };

Registries.Component.extend(ProductsWidgetControlPanel, PosProductsWidgetControlPanel);
