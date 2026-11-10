# Copyright (C) 2014 Aurélien DUMAINE
# Copyright (C) 2015 Akretion (www.akretion.com)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Automatic Cashdrawer Cashlogy",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Manage Automatic Cashdrawer device from POS front end",
    "author": "Aurélien DUMAINE, Druidoo, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "website": "https://github.com/OCA/pos",
    "data": [
        "security/res_groups.xml",
        "views/pos_payment_method.xml",
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_automatic_cashdrawer_cashlogy/static/src/overrides/components/**/*",
            "pos_automatic_cashdrawer_cashlogy/static/src/report/*",
            "pos_automatic_cashdrawer_cashlogy/static/src/dialogs/*",
            "pos_automatic_cashdrawer_cashlogy/static/src/css/*",
        ]
    },
}
