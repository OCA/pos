# Copyright 2023 KMEE INFORMATICA LTDA (http://www.kmee.com.br).
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Takeout",
    "summary": "Adds a Button on POS to identify if the customer is eating here or taking out.",
    "version": "14.0.1.0.0",
    "category": "Sales/Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "KMEE, Odoo Community Association (OCA)",
    "maintainers": ["felipezago"],
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/templates.xml",
        "views/pos_config.xml",
    ],
    "qweb": [
        "static/src/xml/TakeOutButton.xml",
    ],
    "installable": True,
}
