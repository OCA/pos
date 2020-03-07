# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point Of Sale - Check Session State',
    'summary': 'Check if the session state is still opened',
    'version': '12.0.1.0.0',
    'category': 'Point Of Sale',
    'author': 'GRAP, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
        'views/view_pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos_check_session_state.xml',
    ],
    'images': [
        'static/description/error_message.png',
        'static/description/pos_config_form.png',
    ],
    'installable': True,
}
