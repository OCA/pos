import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo12-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo12-addon-pos_access_right',
        'odoo12-addon-pos_customer_required',
        'odoo12-addon-pos_default_empty_image',
        'odoo12-addon-pos_fix_search_limit',
        'odoo12-addon-pos_invoicing',
        'odoo12-addon-pos_margin',
        'odoo12-addon-pos_order_mgmt',
        'odoo12-addon-pos_order_return',
        'odoo12-addon-pos_order_return_traceability',
        'odoo12-addon-pos_partner_firstname',
        'odoo12-addon-pos_payment_terminal',
        'odoo12-addon-pos_picking_delayed',
        'odoo12-addon-pos_report_session_summary',
        'odoo12-addon-pos_ticket_logo',
        'odoo12-addon-pos_ticket_without_price',
        'odoo12-addon-pos_to_weight_by_product_uom',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
