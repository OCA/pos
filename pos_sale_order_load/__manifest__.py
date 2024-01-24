# Copyright (C) Odoo SA. (<http://odoo.com>)
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Sale Order Load",
    "summary": """Point of sale: Import a sales order in an active session of POS""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo SA, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "pos_sale",
    ],
    "data": [
        # Views
        "views/pos_config_views.xml",
        "views/pos_order_views.xml",
        "views/sale_order_views.xml",
        "views/stock_template.xml",
        "views/pos_assets_common.xml",
    ],
    "qweb": [
        "static/src/xml/SetSaleOrderButton.xml",
        "static/src/xml/ReceiptScreen/OrderReceipt.xml",
        "static/src/xml/ProductScreen/Orderline.xml",
        "static/src/xml/OrderManagementScreen/MobileSaleOrderManagementScreen.xml",
        "static/src/xml/OrderManagementScreen/SaleOrderList.xml",
        "static/src/xml/OrderManagementScreen/SaleOrderManagementControlPanel.xml",
        "static/src/xml/OrderManagementScreen/SaleOrderManagementScreen.xml",
        "static/src/xml/OrderManagementScreen/SaleOrderRow.xml",
    ],
}
