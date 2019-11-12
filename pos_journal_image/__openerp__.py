# coding: utf-8
# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Journal Image",
    'summary': "Add images on Account Journals available in the PoS",
    'version': '8.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
        'views/view_account_journal.xml',
    ],
    'qweb': [
        'static/src/xml/pos_journal_image.xml',
    ],
    'demo': [
        'demo/account_journal.xml',
    ],
    'images': [
        'static/description/account_journal_form.png',
        'static/description/pos_payment_list_image.png',
        'static/description/pos_paypad_image.png',
    ],
    'installable': False,
}
