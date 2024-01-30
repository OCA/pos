# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Pos to weight by product uom",
    "summary": "Make 'To Weight' default value depending on product UoM settings",
    "version": "16.0.1.0.0",
    "website": "https://github.com/OCA/pos",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "license": "AGPL-3",
    "installable": True,
    "depends": ["point_of_sale"],
    "post_init_hook": "post_init_hook",
    "data": [
        "views/view_uom_uom.xml",
        "views/view_uom_category.xml",
    ],
}
