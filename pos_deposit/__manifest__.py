{
    "name": "POS Container Deposit",
    "version": "13.0.1.0.0",
    "category": "Point of Sale",
    "summary": "This module is used to manage container deposits for products"
    " in Point of Sale.",
    "author": "Sunflower IT, Open2bizz, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/pos_deposit.xml", "views/product_view.xml"],
    "qweb": ["static/src/xml/pos.xml"],
    "installable": True,
}
