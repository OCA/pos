import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo10-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo10-addon-account_cash_invoice',
        'odoo10-addon-pos_backend_communication',
        'odoo10-addon-pos_backend_partner',
        'odoo10-addon-pos_customer_display',
        'odoo10-addon-pos_default_empty_image',
        'odoo10-addon-pos_default_payment_method',
        'odoo10-addon-pos_fix_search_limit',
        'odoo10-addon-pos_lot_selection',
        'odoo10-addon-pos_loyalty',
        'odoo10-addon-pos_margin',
        'odoo10-addon-pos_order_load',
        'odoo10-addon-pos_order_mgmt',
        'odoo10-addon-pos_order_remove_line',
        'odoo10-addon-pos_order_return',
        'odoo10-addon-pos_partner_firstname',
        'odoo10-addon-pos_payment_entries_globalization',
        'odoo10-addon-pos_payment_terminal',
        'odoo10-addon-pos_picking_delayed',
        'odoo10-addon-pos_price_to_weight',
        'odoo10-addon-pos_pricelist',
        'odoo10-addon-pos_product_template',
        'odoo10-addon-pos_quick_logout',
        'odoo10-addon-pos_remove_pos_category',
        'odoo10-addon-pos_report_session_summary',
        'odoo10-addon-pos_sequence_ref_number',
        'odoo10-addon-pos_session_pay_invoice',
        'odoo10-addon-pos_stock_picking_invoice_link',
        'odoo10-addon-pos_timeout',
        'odoo10-addon-product_brand_pos_report',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 10.0',
    ]
)
