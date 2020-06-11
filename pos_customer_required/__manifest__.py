# Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

{
    'name': 'Point of Sale Require Customer',
    'version': '12.0.1.0.1',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale Require Customer',
    'author': 'Apertoso NV, La Louve, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'static/src/xml/templates.xml',
        'views/pos_config_view.xml',
        'views/pos_order_view.xml',
    ],
    'installable': True,
}
