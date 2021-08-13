# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Journal Image",
    "summary": "Add images on Account Journals available in the PoS",
    "version": "12.0.1.0.1",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://www.github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/templates.xml", "views/view_account_journal.xml"],
    "qweb": ["static/src/xml/pos_journal_image.xml"],
    "images": [
        "static/description/account_journal_form.png",
        "static/description/pos_payment.png",
    ],
    "installable": True,
}
