# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Price to Weight",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Compute weight based on barcodes with prices",
    "author": "La Louve, GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [],
    "demo": [
        "demo/barcode_rule.xml",
        "demo/product_product.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_price_to_weight/static/src/js/ProductScreen.js",
        ],
    },
    "installable": True,
}
