# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos JS Print Manager",
    "category": "Point Of Sale",
    "version": "12.0.1.0.0",
    "author": "ForgeFlow, "
              "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
        "views/pos_config_view.xml",
    ],
    "qweb": [
        'static/src/xml/pos.xml',
    ],
    "installable": True,
}
