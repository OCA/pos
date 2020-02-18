# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Ticket Salesman Firstname",
    "category": "Point Of Sale",
    "version": "12.0.1.0.0",
    "author": "Druidoo, "
              "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "partner_firstname",
    ],
    "data": [
        "views/assets.xml",
        "views/pos_config.xml",
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
    "maintainers": [
        "ivantodorovich",
    ],
    "installable": True,
}
