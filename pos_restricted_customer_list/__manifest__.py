# Copyright 2017-2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS: restricted customer list",
    "version": "16.0.1.0.0",
    "development_status": "Production/Stable",
    "category": "Sales/Point Of Sale",
    "summary": "This module will limit the download of customer data to "
    "only those customers where this has been specifically "
    "requested.",
    "author": "Therp BV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/res_partner.xml",
        "views/res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_restricted_customer_list/static/src/js/PartnerDetailsEdit.js",
        ],
    },
    "installable": True,
}
