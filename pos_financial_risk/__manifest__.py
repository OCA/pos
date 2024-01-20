{
    "name": "Point of Sale Financial Risk",
    "version": "16.0.1.0.1",
    "category": "Sales/Point of Sale",
    "summary": "Point of Sale Fonancial Risk",
    "depends": ["point_of_sale", "account_financial_risk"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix,Odoo Community Association (OCA)",
    "maintainers": ["geomer198", "CetmixGitDrone"],
    "data": [
        "views/pos_payment_method_views.xml",
        "views/res_config_settings_views.xml",
    ],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_financial_risk/static/src/js/*.js",
            "pos_financial_risk/static/src/scss/*.scss",
            "pos_financial_risk/static/src/xml/*.xml",
        ],
    },
    "license": "AGPL-3",
}
