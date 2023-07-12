odoo.define("pos_ask_vat.OrderManagementControlPanel", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderManagementControlPanel = require("point_of_sale.OrderManagementControlPanel");

    const SEARCH_FIELDS = [
        "pos_reference",
        "partner_id.display_name",
        "date_order",
        "customer_tax_id",
    ];

    const OrderManagementControlPanelCRM = (OrderManagementControlPanel) =>
        class extends OrderManagementControlPanel {
            get searchFields() {
                return SEARCH_FIELDS;
            }
        };

    Registries.Component.extend(
        OrderManagementControlPanel,
        OrderManagementControlPanelCRM
    );

    return OrderManagementControlPanelCRM;
});
