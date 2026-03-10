# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos receipt gift card",
    "summary": """Attach the generated gift card code to the sales ticket""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Binhex,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "pos_loyalty",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            (
                "after",
                "pos_loyalty/static/src/**/*",
                "pos_receipt_gift_card/static/src/app/**/*.esm.js",
            ),
            "pos_receipt_gift_card/static/src/app/**/*.scss",
            "pos_receipt_gift_card/static/src/app/**/*.xml",
        ],
    },
}
