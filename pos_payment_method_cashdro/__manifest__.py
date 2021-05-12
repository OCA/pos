# Copyright 2021 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "PoS Payment Method CashDro",
    "summary": "Allows to pay with CashDro Terminals on the Point of Sale",
    "version": "12.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
        "views/account_journal.xml",
    ],
    "qweb": ["static/src/xml/pos_cashdro_terminal.xml"],
    "installable": True,
}
