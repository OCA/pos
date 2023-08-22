{
    "name": "PoS Order To Sale Order: Report",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Report will be downloaded after the sales order is created.",
    "depends": ["pos_order_to_sale_order"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix,Odoo Community Association (OCA)",
    "maintainers": ["GabbasovDinar", "CetmixGitDrone"],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_order_to_sale_order_report/static/src/js/**/*.js",
        ],
    },
    "license": "AGPL-3",
}
