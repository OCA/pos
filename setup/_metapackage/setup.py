import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-pos_customer_comment>=16.0dev,<16.1dev',
        'odoo-addon-pos_default_partner>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_reorder>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_to_sale_order>=16.0dev,<16.1dev',
        'odoo-addon-pos_receipt_hide_price>=16.0dev,<16.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 16.0',
    ]
)
