import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-pos_event_sale>=15.0dev,<15.1dev',
        'odoo-addon-pos_event_sale_registration_qr_code>=15.0dev,<15.1dev',
        'odoo-addon-pos_hide_cost_price_and_margin>=15.0dev,<15.1dev',
        'odoo-addon-pos_lot_barcode>=15.0dev,<15.1dev',
        'odoo-addon-pos_lot_selection>=15.0dev,<15.1dev',
        'odoo-addon-pos_product_display_default_code>=15.0dev,<15.1dev',
        'odoo-addon-pos_sale_pos_event_sale>=15.0dev,<15.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 15.0',
    ]
)
