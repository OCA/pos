# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Extra Company Info (France)",
    "summary": "Add siret company infos on the ticket",
    "version": "12.0.1.0.2",
    "category": "Sales/Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "GRAP, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "pos_ticket_extra_company_info",
        "l10n_fr",
    ],
    "data": ["views/templates.xml"],
    "qweb": ["static/src/xml/pos_ticket_extra_company_info_l10n_fr.xml"],
    "installable": True,
}
