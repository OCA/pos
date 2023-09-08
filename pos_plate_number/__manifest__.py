# Copyright (C) 2023 KMEE (http://www.kmee.com.br)
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Plate Number",
    "summary": "Allows setting a plate number on POS.",
    "version": "14.0.1.0.0",
    "category": "Sales/Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "KMEE, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/view_pos_config.xml", "views/templates.xml"],
    "qweb": [
        "static/src/xml/OrderReceipt.xml",
    ],
    "installable": True,
}
