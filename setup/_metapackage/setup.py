import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo13-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo13-addon-pos_default_partner',
        'odoo13-addon-pos_empty_home',
        'odoo13-addon-pos_event_sale',
        'odoo13-addon-pos_fix_search_limit',
        'odoo13-addon-pos_fixed_discount',
        'odoo13-addon-pos_margin',
        'odoo13-addon-pos_order_mgmt',
        'odoo13-addon-pos_order_remove_line',
        'odoo13-addon-pos_order_to_sale_order',
        'odoo13-addon-pos_partner_lang',
        'odoo13-addon-pos_payment_method_image',
        'odoo13-addon-pos_payment_terminal',
        'odoo13-addon-pos_product_sort',
        'odoo13-addon-pos_quick_logout',
        'odoo13-addon-pos_report_session_summary',
        'odoo13-addon-pos_timeout',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 13.0',
    ]
)
