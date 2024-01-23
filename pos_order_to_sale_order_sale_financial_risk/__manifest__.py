{
    "name": "Sale Financial Risk in POS",
    "version": "16.0.1.0.1",
    "category": "Sales/Point of Sale",
    "summary": "Sale Financial Risk control for Sales Orders created from POS",
    "depends": ["sale_financial_risk", "pos_order_to_sale_order_delivery"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix,Odoo Community Association (OCA)",
    "maintainers": ["geomer198", "CetmixGitDrone"],
    "data": ["data/demo.xml"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_order_to_sale_order_sale_financial_risk/static/src/js/*.esm.js",
        ],
        "web.assets_tests": [
            "pos_order_to_sale_order_sale_financial_risk/static/src/tests/tours/SaleFinancialRiskPosCompatibility.tour.esm.js",  # noqa
        ],
    },
    "license": "AGPL-3",
}
