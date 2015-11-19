# -*- coding: utf-8 -*-
# (c) 2015 Daniel Campos <danielcampos@avanzosc.es> - Avanzosc S.L.
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "POS invoicing from picking",
    "version": "8.0.1.0.0",
    'author': 'OdooMRP team',
    'website': "http://www.odoomrp.com",
    'license': 'AGPL-3',
    'contributors': ["Daniel Campos <danielcampos@avanzosc.es>",
                     "Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>",
                     "Ana Juaristi <ajuaristio@gmail.com>"],
    "depends": ['point_of_sale', 'stock_account',
                'stock_picking_invoice_link'],
    "category": "POS",
    "data": ['views/point_of_sale_view.xml'
             ],
    "installable": True
}
