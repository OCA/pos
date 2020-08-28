# Copyright 2017-2019 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS: restricted customer list",
    "version": "13.0.1.0.0",
    "development_status": "Production/Stable",
    "category": "Sales/Point Of Sale",
    "summary": "This module will limit the download of customer data to "
    "only those customers where this has been specifically "
    "requested.",
    "author": "Therp BV, Odoo Community Association (OCA)",
    "website": "https://odoo-community.org/",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/assets_backend.xml", "views/res_partner.xml"],
}
