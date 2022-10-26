# © 2019 Solvos Consultoría Informática (<http://www.solvos.es>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Ticket Without Price",
    "summary": "Adds receipt ticket without price or taxes",
    "version": "14.0.1.0.0",
    "author": "Odoo Community Association (OCA), Solvos",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point Of Sale",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_templates.xml",
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
    "installable": True,
}
