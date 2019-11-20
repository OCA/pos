import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo12-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo12-addon-pos_access_right',
        'odoo12-addon-pos_invoicing',
        'odoo12-addon-pos_margin',
        'odoo12-addon-pos_order_mgmt',
        'odoo12-addon-pos_picking_delayed',
        'odoo12-addon-pos_report_session_summary',
        'odoo12-addon-pos_ticket_logo',
        'odoo12-addon-pos_to_weight_by_product_uom',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
