# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale Payment Credit',
    'version': '12.0.1.0.2',
    'category': 'Point Of Sale',
    'author': 'Trobz',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'data/account_journal_data.xml',
        "views/assets.xml",
        'views/account_journal_view.xml',
        'views/res_partner_view.xml',
        'views/pos_config.xml',
        'wizard/pos_make_payment_view.xml',
    ],
    "qweb": [
        "static/src/xml/pos.xml",
    ],
    'installable': True,
}
