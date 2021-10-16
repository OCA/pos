import setuptools

with open('VERSION.txt', 'r') as f:
    version = f.read().strip()

setuptools.setup(
    name="odoo8-addons-oca-pos",
    description="Meta package for oca-pos Odoo addons",
    version=version,
    install_requires=[
        'odoo8-addon-hw_customer_display',
        'odoo8-addon-hw_telium_payment_terminal',
        'odoo8-addon-pos_autoreconcile',
        'odoo8-addon-pos_cash_move_reason',
        'odoo8-addon-pos_customer_display',
        'odoo8-addon-pos_customer_required',
        'odoo8-addon-pos_default_empty_image',
        'odoo8-addon-pos_gift_ticket',
        'odoo8-addon-pos_invoice_journal',
        'odoo8-addon-pos_margin',
        'odoo8-addon-pos_order_load',
        'odoo8-addon-pos_order_picking_link',
        'odoo8-addon-pos_order_pricelist_change',
        'odoo8-addon-pos_order_to_sale_order',
        'odoo8-addon-pos_payment_entries_globalization',
        'odoo8-addon-pos_payment_terminal',
        'odoo8-addon-pos_picking_load',
        'odoo8-addon-pos_pricelist',
        'odoo8-addon-pos_product_template',
        'odoo8-addon-pos_remove_pos_category',
        'odoo8-addon-pos_restricted_customer_list',
        'odoo8-addon-pos_sequence_ref_number',
        'odoo8-addon-pos_store_draft_order',
        'odoo8-addon-pos_ticket_logo',
        'odoo8-addon-pos_to_weight_by_product_uom',
    ],
    classifiers=[
        'Programming Language :: Python',
        'Framework :: Odoo',
        'Framework :: Odoo :: 8.0',
    ]
)
