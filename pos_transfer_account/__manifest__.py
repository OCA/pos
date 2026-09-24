# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Transfer Account",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "author": "La Louve, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
    ],
    "data": ["views/view_pos_config.xml", "views/res_config_settings_view.xml"],
    "demo": [
        "demo/account_account.xml",
        "demo/pos_config.xml",
    ],
    "installable": True,
}
