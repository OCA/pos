# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Ask Customer",
    "summary": """Point of Sale: Ask Customer Code or Tax ID""",
    "version": "16.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_config_view.xml",
        # Templates
        # "views/pos_template.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_crm/static/src/js/db.js",
            "pos_crm/static/src/js/models.js",
            "pos_crm/static/src/js/PaymentScreen.js",
            "pos_crm/static/src/js/ProductScreen.js",
            "pos_crm/static/src/js/Popups/TaxIdPopup.js",
            "pos_crm/static/src/js/Misc/NumberBuffer.js",
            # "pos_crm/static/src/js/Screens/OrderManagementControlPanel.js",
            # "pos_crm/static/src/js/Screens/OrderFetcher.js",
            #
            "pos_crm/static/src/xml/Popups/TaxIdPopup.xml",
        ],
    },
}
