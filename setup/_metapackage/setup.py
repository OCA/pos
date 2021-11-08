import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo11-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo11-addon-pos_cashier_login',
        'odoo11-addon-pos_config_show_accounting',
        'odoo11-addon-pos_default_payment_method',
        'odoo11-addon-pos_fix_search_limit',
        'odoo11-addon-pos_lot_selection',
        'odoo11-addon-pos_loyalty',
        'odoo11-addon-pos_margin',
        'odoo11-addon-pos_order_mgmt',
        'odoo11-addon-pos_order_return',
        'odoo11-addon-pos_payment_entries_globalization',
        'odoo11-addon-pos_picking_delayed',
        'odoo11-addon-pos_price_to_weight',
        'odoo11-addon-pos_session_pay_invoice',
        'odoo11-addon-pos_stock_picking_invoice_link',
        'odoo11-addon-pos_ticket_logo',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 11.0',
    ]
)
