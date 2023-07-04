odoo.define(
    "pos_order_to_sale_order_sale_financial_risk.SaleFinancialRiskPosCompatibility",
    function (require) {
        const Tour = require("web_tour.tour");

        const steps = [
            {
                content: "Test pos_order_to_sale_order: Waiting for loading to finish",
                trigger: "body:not(:has(.loader))",
                // eslint-disable-next-line no-empty-function
                run: () => {},
            },
            {
                content: "Test pos_order_to_sale_order: Close Opening cashbox popup",
                trigger: "div.opening-cash-control .button:contains('Open session')",
            },
            {
                content:
                    "Test pos_order_to_sale_order: Leave category displayed by default",
                trigger: ".breadcrumb-home",
                // eslint-disable-next-line no-empty-function
                run: () => {},
            },
            {
                content:
                    "Test pos_order_to_sale_order: Order a 'Whiteboard Pen' (price 3.20)",
                trigger: ".product-list .product-name:contains('Whiteboard Pen')",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Click on 'Customer' Button",
                trigger: "button.set-partner",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Select a customer 'Test Partner'",
                trigger: "tr.partner-line td div:contains('Abdulah')",
            },
            {
                content: "Test pos_order_to_sale_order: Click on More...",
                trigger: "div.control-button:contains('More...')",
                skip_trigger: "span.control-button span:contains('Create Order')",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Click on 'Create Order' Button",
                trigger: "span.control-button span:contains('Create Order')",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Click on 'Create Confirmed Sale Order' Button",
                trigger:
                    "div.button-sale-order span:contains('Create Confirmed Sale Order')",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Confirm popup click on 'Cancel' Button",
                trigger: ".modal-dialog .cancel",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Close the Point of Sale frontend",
                trigger: ".header-button",
            },
            {
                content:
                    "Test pos_order_to_sale_order_sale_financial_risk: Confirm closing the frontend",
                trigger: ".header-button",
                // eslint-disable-next-line no-empty-function
                run: () => {},
            },
        ];

        Tour.register(
            "SaleOrderConfirmFinancialRiskPosCompatibility",
            {test: true, url: "/pos/ui"},
            steps
        );
    }
);
