{
    "name": "PoS show discount from pricelist",
    "summary": "PoS: show appropriate discount when discounting from pricelist",
    "version": "14.0.1.0.1",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Odoo Community Association (OCA), Ooops404, PyTech SRL, Akretion",
    "maintainers": ["aleuffre", "pytech-bot"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "templates/assets.xml",
        "views/pos_config_view.xml",
    ],
    "demo": [
        "demo/product_pricelist_demo.xml",
        "demo/pos_config_demo.xml",
        "demo/res_users_demo.xml",
    ],
    "qweb": [
        "static/src/xml/Orderline.xml",
    ],
}
