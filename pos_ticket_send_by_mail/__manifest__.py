# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

{
    'name': 'POS Receipt By Email',
    'version': '12.0.1.0.0',
    'category': 'Custom',
    'author': 'Druidoo',
    'website': 'https://www.druidoo.io',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/report_paperformat.xml',
        'views/view_pos_config_settings.xml',
        'data/email_template_data.xml',
        'data/ir_cron_data.xml',
        'views/view_res_partner.xml',
        'views/report_receipt.xml',
        'static/src/xml/templates.xml',
    ],
    'installable': True,
}
