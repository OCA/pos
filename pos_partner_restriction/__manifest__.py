# Copyright 2026 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    "name": "POS - Partner Restriction",
    "summary": "Restrict which partners are loaded and selectable in the POS",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Therp BV, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "maintainers": ["ntsirintanis"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_partner_views.xml",
    ],
    "installable": True,
}
