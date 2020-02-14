# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Quick Logout',
    'version': '12.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Allow PoS user to logout quickly after user changed',
    'license': 'AGPL-3',
    'author': 'La Louve, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/pos_config_view.xml',
        'views/assets.xml',
    ],
    'qweb': [
        'static/src/xml/pos_quick_logout.xml',
    ],
    'installable': True,
}
