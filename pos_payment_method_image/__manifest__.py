{
    "name": "Point of Sale - Payment Method Image",
    "summary": "Add images on Payment Methods available in the PoS",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "author": "Odoo SA, GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/view_pos_payment_method.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_payment_method_image/static/src/js/PaymentScreen.js",
            "pos_payment_method_image/static/src/css/pos_payment_method_image.css",
            "pos_payment_method_image/static/src/xml/pos_payment_method_image.xml",
        ],
    },
    "installable": True,
}
