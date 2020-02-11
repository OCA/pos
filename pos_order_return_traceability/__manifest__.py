# © 2020 Solvos Consultoría Informática (<http://www.solvos.es>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS frontend return traceability",
    "summary": "Adds full return traceability to POS frontend",
    "version": "12.0.1.0.0",
    "author": "Odoo Community Association (OCA), Solvos",
    "website": "http://www.github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point Of Sale",
    "depends": [
        'pos_order_mgmt',
        'pos_order_return',
    ],
    'data': [
        "views/pos_templates.xml",
    ],
    "qweb": [
        'static/src/xml/pos.xml',
    ],
    'installable': True,
}
