# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "PoS Order Margin & Account Invoice Margin",
    "summary": "Margin on Account invoices generated by PoS",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP," "Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "pos_margin",
        "account_invoice_margin",
    ],
    "post_init_hook": "set_margin_on_pos_invoices",
    "installable": True,
    "auto_install": True,
}
