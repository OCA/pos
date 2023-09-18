# Copyright 2014-2020 Aurélien DUMAINE
# Copyright 2014-2020 Akretion France (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale - LED Customer Display",
    "version": "14.0.1.1.0",
    "category": "Point Of Sale",
    "summary": "Manage LED Customer Display device from POS front end",
    "author": "Aurélien DUMAINE,GRAP,Akretion,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/pos",
    "depends": ["pos_epson_printer"],
    "data": [
        "views/assets.xml",
        "views/view_pos_config.xml",
    ],
    "installable": True,
}
