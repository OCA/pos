# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Receipt - Vat Details",
    "version": "16.0.1.0.0",
    "summary": "Add Vat Details on Receipt (base and vat amounts).",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "depends": ["point_of_sale"],
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "license": "AGPL-3",
    "assets": {
        "point_of_sale.assets": [
            "pos_receipt_vat_detail/static/src/js/**/*.js",
            "pos_receipt_vat_detail/static/src/xml/**/*.xml",
        ],
    },
}
