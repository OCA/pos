# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Pos Payment Terminal Server',
    'summary': """
        Adds the possibility to manage several terminals with one server""",
    'version': '9.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'ACSONE SA/NV,Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'depends': [
        'point_of_sale',
        'pos_payment_terminal',
    ],
    'data': [
        'views/pos_config.xml',
        'views/pos_payment_multi_terminal_template.xml',
    ],
    'qweb': ['static/src/xml/pos_payment_terminal.xml'],
    'installable': True,
}
