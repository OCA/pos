# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Tare generate barcode",
    'version': '12.0.1.0.0',
    'category': 'Point of Sale',
    'summary': """Point of Sale - print tare \
                  barecodes labels.""",
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'maintainers': ['fkawala'],
    'depends': ['point_of_sale', 'pos_tare'],
    'data': [
        'pos_tare_generate_barcode.xml',
        'views/pos_config_view.xml'
    ],
    'qweb': [
        'static/src/xml/pos_tare_generate_barcode.xml',
    ],
    'installable': True,
}
