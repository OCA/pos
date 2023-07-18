{
    "name": "POS - Product Template",
    "version": "14.0.1.0.3",
    "category": "Point Of Sale",
    "author": "Akretion,Odoo Community Association (OCA)",
    "summary": "Manage Product Template in Front End Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
        "views/pos_config_view.xml",
    ],
    "qweb": [
        "static/src/xml/ppt.xml",
        "static/src/xml/SelectVariantPopup.xml",
    ],
    "demo": [
        "demo/product_attribute_value.xml",
        "demo/product_product.xml",
    ],
    "images": [
        "static/src/img/screenshots/pos_product_template.png",
    ],
    "installable": True,
}
