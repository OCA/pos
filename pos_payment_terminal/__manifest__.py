# © 2014-2016 Aurélien DUMAINE
# © 2015-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'POS Payment Terminal',
    'version': '12.0.0.1.1',
    'category': 'Point Of Sale',
    'summary': 'Manage Payment Terminal device from POS front end',
    'author': "Aurélien DUMAINE,GRAP,Akretion,"
              "Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config.xml',
        'views/account_journal.xml',
        'views/assets.xml',
        ],
    'demo': ['demo/pos_config.xml'],
    'qweb': ['static/src/xml/pos_payment_terminal.xml'],
    'installable': True,
}
