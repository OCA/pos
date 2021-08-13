# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Point of Sale - Places',
    'summary': "Define places on PoS orders",
    'version': '12.0.1.0.2',
    'category': 'Point of Sale',
    'author': 'GRAP,Odoo Community Association (OCA)',
    'maintainers': ['legalsylvain'],
    'website': 'http://www.github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/ir_module_category.xml',
        'security/ir_rule.xml',
        'security/res_groups.xml',
        'security/ir.model.access.csv',
        'views/templates.xml',
        'views/view_pos_config.xml',
        'views/view_pos_place.xml',
        'views/view_pos_order.xml',
    ],
    'qweb': [
        'static/src/xml/pos_place.xml',
    ],
    'demo': [
        'demo/res_groups.xml',
        'demo/pos_place.xml',
    ],
    'images': [
        'static/description/pos_front_end_ui.png',
        'static/description/pos_config_form.png',
        'static/description/pos_order_search.png',
    ],
}
