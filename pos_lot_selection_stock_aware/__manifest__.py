{
    "name": "POS Lot Selection - Stock Aware",
    "summary": "Stock-aware lot selection with quantities in Point of Sale",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "author": "Nathan Kirui, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "stock",
        "pos_lot_selection",
    ],
    "data": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_lot_selection_stock_aware/static/src/js/EditListPopup.esm.js",
            "pos_lot_selection_stock_aware/static/src/xml/LotSelectorPopup.xml",
        ],
    },
    "installable": True,
    "development_status": "Beta",
    "maintainers": ["nkirui"],
}
