{
    "name": "Point of Sale - Product Info Position",
    "summary": "Point of Sale - Product Info Position",
    "version": "17.0.1.0.0",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "Serpent Consulting Services Pvt. Ltd.,Odoo Community Association (OCA)",
    "maintainers": ["Serpent Consulting Services Pvt. Ltd."],
    "license": "AGPL-3",
    "installable": True,
    "development_status": "Alpha",
    "depends": ["point_of_sale", "stock_location_position"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_product_info_position/static/src/popup/product_info_position_popup.xml",
            "pos_product_info_position/static/src/popup/product_info_popup.xml",
            "pos_product_info_position/static/src/popup/product_info_position_popup.esm.js",
            "pos_product_info_position/static/src/popup/product_info_popup.esm.js",
        ]
    },
}
