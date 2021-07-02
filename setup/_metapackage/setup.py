import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo14-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo14-addon-pos_access_right',
        'odoo14-addon-pos_default_partner',
        'odoo14-addon-pos_payment_terminal',
        'odoo14-addon-pos_product_sort',
        'odoo14-addon-pos_require_product_quantity',
        'odoo14-addon-pos_show_config_name',
        'odoo14-addon-pos_supplierinfo_search',
        'odoo14-addon-pos_timeout',
        'odoo14-addon-pos_user_restriction',
        'odoo14-addon-pos_warning_exiting',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
