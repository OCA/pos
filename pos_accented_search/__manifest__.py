# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Accented Product Search",
    'version': '12.0.1.0.1',
    'category': 'Point of Sale',
    'summary': 'Point of Sale - Product search works regardless of accented characters',
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'maintainers': ['fkawala'],
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
    ],
    'installable': True,
}
