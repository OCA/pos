{
    "name": "PoS Order To Sale Order: Delivery",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Compatibility of pos_order_to_sale_order and delivery modules",
    "depends": ["pos_order_to_sale_order", "delivery"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix,Odoo Community Association (OCA)",
    "maintainers": ["GabbasovDinar", "CetmixGitDrone"],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_order_to_sale_order_delivery/static/src/css/pos.css",
            "pos_order_to_sale_order_delivery/static/src/js/**/*.js",
            "pos_order_to_sale_order_delivery/static/src/xml/**/*.xml",
        ],
    },
    "license": "AGPL-3",
}
