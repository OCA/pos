{
    "name": "Point of Sale - Kiosk Mode",
    "version": "14.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Kiosk mode extension for the Point of Sale ",
    "description": """This module allows you to use the Point of Sale in Kiosk mode.""",
    "depends": ["point_of_sale"],
    "development_status": "Alpha",
    "website": "https://github.com/OCA/pos",
    "data": [
        "views/pos_config_view.xml",
        "views/pos_assets_kiosk_common.xml",
        "views/pos_assets_kiosk_index.xml",
    ],
    "qweb": [
        "static/src/xml/ChromeKiosk.xml",
        "static/src/xml/Screens/BannerScreen.xml",
        "static/src/xml/Screens/MainScreen.xml",
        "static/src/xml/Screens/KioskPaymentScreen.xml",
        "static/src/xml/Modals/InsertProductModal.xml",
        "static/src/xml/Modals/InsertProductConfigurableModal.xml",
        "static/src/xml/Modals/CartModal.xml",
        "static/src/xml/Screens/KioskReceiptScreen.xml",
    ],
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
}
