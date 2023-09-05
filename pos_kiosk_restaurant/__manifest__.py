{
    "name": "Point of Sale - Kiosk Mode (Restaurant)",
    "version": "14.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Kiosk mode extension for the Point of Sale in Restaurant version",
    "description": """This module allows you to use the Point of Sale in Kiosk mode with Restaurant.""",
    "depends": ["pos_kiosk", "pos_restaurant"],
    "development_status": "Alpha",
    "website": "https://github.com/OCA/pos",
    "data": [
        "views/pos_kiosk_restaurant_templates.xml",
    ],
    "qweb": [],
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
}
