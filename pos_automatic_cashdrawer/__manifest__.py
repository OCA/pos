# Copyright (C) 2014 Aurélien DUMAINE
# Copyright (C) 2015 Akretion (www.akretion.com)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Automatic Cashdrawer",
    "version": "12.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Manage Automatic Cashdrawer device from POS front end",
    "author": "Aurélien DUMAINE, Druidoo",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "security/res_groups.xml",
        "views/assets.xml",
        "views/account_journal.xml",
        "views/pos_config.xml",
    ],
    "qweb": ["static/src/xml/pos_automatic_cashdrawer.xml"],
    "demo": ["demo/demo.xml"],
}
