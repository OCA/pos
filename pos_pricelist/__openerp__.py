# -*- coding: utf-8 -*-
# © 2014-2015 Taktik (http://www.taktik.be) - Adil Houmadi <ah@taktik.be>
# © 2016 Serv. Tecnol. Avanzados - Pedro M. Baeza
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Pricelist',
    'version': '9.0.1.3.0',
    'category': 'Point Of Sale',
    'images': [],
    'sequence': 1,
    'author': "Adil Houmadi @Taktik, \
     IT-Projects LLC, Serv. Tecnol. Avanzados - Pedro M. Baeza, \
     Odoo Community Association (OCA)",
    'summary': 'Pricelist for Point of sale',
    'license': 'AGPL-3',
    'depends': [
        "point_of_sale",
    ],
    'data': [
        "views/pos_pricelist_template.xml",
        "views/point_of_sale_view.xml",
        "report/report_receipt.xml",
        "security/ir.model.access.csv",
        "security/account_fiscal_position_security.xml",
    ],
    'demo': [
        'demo/pos_pricelist_demo.yml',
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'post_init_hook': "set_pos_line_taxes",
    'installable': True,
}
