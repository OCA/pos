# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Mathieu VATEL <mathieu@julius.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Automatic Validation',
    'version': '12.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Manage Automatic Validation after complete '
    'payment in the POS front end',
    'author': "Julius Network Solutions, Druidoo",
    'website': 'https://cooplalouve.fr/',
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/account_journal_view.xml',
        'static/src/xml/templates.xml',
    ],
    'installable': True,
}
