# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Extra Company Info (France)",
    "summary": "Add siret company infos on the ticket",
    "version": "16.0.1.0.0",
    "category": "Sales/Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "license": "AGPL-3",
    "depends": ["point_of_sale", "l10n_fr"],
    "assets": {
        "point_of_sale.assets": [
            "pos_ticket_extra_company_info_l10n_fr/static/src/js/models.esm.js",
            "pos_ticket_extra_company_info_l10n_fr/static/src/xml/OrderReceipt.xml",
        ],
    },
    "installable": True,
}
