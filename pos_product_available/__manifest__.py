{
    "name": "Point of Sale Products Available",
    "summary": """Visible products for each different Point of Sale""",
    "category": "Point Of Sale",
    "author": "Carlos Franco Cifuentes, Esment, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "version": "16.0.0.1.0",
    "license": "AGPL-3",
    "depends": ["product", "point_of_sale"],
    'data': [
        "views/product_view.xml",
        "views/res_config_settings_view.xml",
    ],
    'assets': {
        'point_of_sale.assets': [
            # Here includes the lib and POS UI assets.
            'pos_product_available/static/src/js/Screens/ProductScreen/ProductsWidget.js',
        ],
    }
}
