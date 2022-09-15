odoo.define("pos_crm.OrderManagementControlPanel", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderManagementControlPanel = require("point_of_sale.OrderManagementControlPanel");

    const SEARCH_FIELDS = [
        "pos_reference",
        "partner_id.display_name",
        "date_order",
        "partner_vat",
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
