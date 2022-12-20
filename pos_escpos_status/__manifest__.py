# Copyright 2020 Akretion (https://www.akretion.com).
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS ESC/Pos printer Status",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Point of sale: fetch status for 'escpos' driver",
    "author": "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": ["/pos_escpos_status/static/src/js/ProxyStatus.js"],
    },
    "installable": True,
}
