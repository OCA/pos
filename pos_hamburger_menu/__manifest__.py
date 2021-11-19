# copyright 2020 KMEE - Luiz Felipe do Divino <luiz.divino@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale Hamburger Menu",
    "summary": "Add a Hamburger menu at POS header",
    "license": "AGPL-3",
    "version": "12.0.1.0.1",
    "author": "Kmee,"
              "Odoo Community Association (OCA)",
    "maintainer": "Kmee",
    "category": "Point of sale",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        'views/pos_assets.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    "website": "https://github.com/OCA/pos",
    "installable": True,
}
