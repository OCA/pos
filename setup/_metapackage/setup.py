import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo-addon-pos_access_right>=16.0dev,<16.1dev',
        'odoo-addon-pos_customer_comment>=16.0dev,<16.1dev',
        'odoo-addon-pos_default_partner>=16.0dev,<16.1dev',
        'odoo-addon-pos_discount_all>=16.0dev,<16.1dev',
        'odoo-addon-pos_edit_order_line>=16.0dev,<16.1dev',
        'odoo-addon-pos_escpos_status>=16.0dev,<16.1dev',
        'odoo-addon-pos_financial_risk>=16.0dev,<16.1dev',
        'odoo-addon-pos_global_discount_in_line>=16.0dev,<16.1dev',
        'odoo-addon-pos_lot_barcode>=16.0dev,<16.1dev',
        'odoo-addon-pos_lot_selection>=16.0dev,<16.1dev',
        'odoo-addon-pos_loyalty_redeem_payment>=16.0dev,<16.1dev',
        'odoo-addon-pos_margin>=16.0dev,<16.1dev',
        'odoo-addon-pos_membership>=16.0dev,<16.1dev',
        'odoo-addon-pos_minimize_menu>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_remove_line>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_reorder>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_to_sale_order>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_to_sale_order_delivery>=16.0dev,<16.1dev',
        'odoo-addon-pos_order_to_sale_order_report>=16.0dev,<16.1dev',
        'odoo-addon-pos_partner_birthdate>=16.0dev,<16.1dev',
        'odoo-addon-pos_partner_firstname>=16.0dev,<16.1dev',
        'odoo-addon-pos_payment_change>=16.0dev,<16.1dev',
        'odoo-addon-pos_payment_terminal>=16.0dev,<16.1dev',
        'odoo-addon-pos_product_display_default_code>=16.0dev,<16.1dev',
        'odoo-addon-pos_product_label>=16.0dev,<16.1dev',
        'odoo-addon-pos_product_multi_barcode>=16.0dev,<16.1dev',
        'odoo-addon-pos_product_packaging_multi_barcode>=16.0dev,<16.1dev',
        'odoo-addon-pos_product_quick_info>=16.0dev,<16.1dev',
        'odoo-addon-pos_receipt_hide_price>=16.0dev,<16.1dev',
        'odoo-addon-pos_reset_search>=16.0dev,<16.1dev',
        'odoo-addon-pos_sale_order_print>=16.0dev,<16.1dev',
        'odoo-addon-pos_stock_available_online>=16.0dev,<16.1dev',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 16.0',
    ]
)
