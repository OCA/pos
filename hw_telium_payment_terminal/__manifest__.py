# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Hardware Telium Payment Terminal',
    'version': '12.0.1.0.0',
    'category': 'Hardware Drivers',
    'license': 'AGPL-3',
    'summary': 'Adds support for Payment Terminals using Telium protocol',
    'author': "Akretion,Odoo Community Association (OCA)",
    'website': 'http://www.github.com/OCA/pos',
    'depends': ['hw_proxy'],
    'external_dependencies': {
        'python': ['serial', 'pycountry'],
    },
    'data': [],
    'installable': False,
}
