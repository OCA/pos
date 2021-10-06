import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo14-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo14-addon-pos_access_right',
        'odoo14-addon-pos_backend_communication',
        'odoo14-addon-pos_cash_move_reason',
        'odoo14-addon-pos_default_partner',
        'odoo14-addon-pos_empty_home',
        'odoo14-addon-pos_escpos_status',
        'odoo14-addon-pos_fixed_discount',
        'odoo14-addon-pos_hide_banknote_button',
        'odoo14-addon-pos_margin',
        'odoo14-addon-pos_order_remove_line',
        'odoo14-addon-pos_order_return',
        'odoo14-addon-pos_payment_change',
        'odoo14-addon-pos_payment_terminal',
        'odoo14-addon-pos_product_sort',
        'odoo14-addon-pos_receipt_hide_price',
        'odoo14-addon-pos_require_product_quantity',
        'odoo14-addon-pos_reset_search',
        'odoo14-addon-pos_show_config_name',
        'odoo14-addon-pos_supplierinfo_search',
        'odoo14-addon-pos_ticket_without_price',
        'odoo14-addon-pos_timeout',
        'odoo14-addon-pos_user_restriction',
        'odoo14-addon-pos_warning_exiting',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
    ]
)
