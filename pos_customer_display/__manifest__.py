# © 2014-2016 Aurélien DUMAINE
# © 2014-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale - LED Customer Display",
    "version": "12.0.1.1.2",
    "category": "Point Of Sale",
    "summary": "Manage LED Customer Display device from POS front end",
    "author": "Aurélien DUMAINE,GRAP,Akretion,Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/pos',
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/assets.xml",
        "views/view_pos_config.xml",
    ],
    "installable": True,
}
