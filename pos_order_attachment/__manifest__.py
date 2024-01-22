# Copyright 2024 Dixmit,Invitu
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Attachment",
    "summary": """
        Add attachments on a point of sale order""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,Invitu,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_order.xml",
    ],
    "demo": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "web/static/src/scss/mimetypes.scss",
            "web/static/src/views/fields/file_handler.js",
            "web/static/src/views/fields/file_handler.xml",
            "pos_order_attachment/static/src/**/*.js",
            "pos_order_attachment/static/src/**/*.xml",
            "pos_order_attachment/static/src/**/*.scss",
        ],
    },
}
