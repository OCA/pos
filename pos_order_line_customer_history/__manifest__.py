{
    "name": "Point of Sale - Customer history",
    "summary": "Adds product in the customer history screen of POS",
    "version": "17.0.1.0.0",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "Serpent Consulting Services Pvt. Ltd., Odoo Community Association (OCA)",
    "maintainers": ["Serpent Consulting Services Pvt. Ltd."],
    "license": "AGPL-3",
    "installable": True,
    "development_status": "Alpha",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_line_customer_history/static/src/Buttons/customer_history.xml",
            "pos_order_line_customer_history/static/src/Screens/CustomerHistoryScreen.xml",
            "pos_order_line_customer_history/static/src/Screens/CustomerHistoryScreen.scss",
            "pos_order_line_customer_history/static/src/Screens/CustomerHistoryScreen.esm.js",
            "pos_order_line_customer_history/static/src/Buttons/customer_history.esm.js",
            "pos_order_line_customer_history/static/src/models/pos_store.esm.js",
            "pos_order_line_customer_history/static/src/navbar/back_button.esm.js",
        ]
    },
}
