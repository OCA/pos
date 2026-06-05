{
    "name": "POS Early Receipt Printing",
    "summary": "Generate bill from Shop",
    "version": "18.0.1.0.0",
    "category": "POS",
    "website": "https://github.com/OCA/pos",
    "author": "Sygel, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": ["pos_restaurant"],
    "data": ["views/pos_config_views.xml"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_early_receipt_printing/static/src/xml/control_buttons.xml",
        ],
    },
}
