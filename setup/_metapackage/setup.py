import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo9-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo9-addon-pos_accented_search',
        'odoo9-addon-pos_access_right',
        'odoo9-addon-pos_barcode_tare',
        'odoo9-addon-pos_customer_display',
        'odoo9-addon-pos_customer_required',
        'odoo9-addon-pos_empty_home',
        'odoo9-addon-pos_payment_terminal',
        'odoo9-addon-pos_price_to_weight',
        'odoo9-addon-pos_product_template',
        'odoo9-addon-pos_quick_logout',
        'odoo9-addon-pos_reset_search',
        'odoo9-addon-pos_restricted_customer_list',
        'odoo9-addon-pos_return_order',
        'odoo9-addon-pos_session_summary',
        'odoo9-addon-pos_transfer_account',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 9.0',
    ]
)
