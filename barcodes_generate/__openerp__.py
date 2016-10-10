# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Barcodes - Generate',
    'summary': 'Generate Barcodes for Products and Customers',
    'version': '1.0',
    'category': 'Point Of Sale',
    'description': """
============================================
Generate Barcodes for Products and Customers
============================================

This module depends on a backport of the V9 modules of Odoo 'barcodes'.

It expends Odoo functionnality, to allow user to generate barcode depending
on a given barcode rule.

For exemple, a typical pattern for products is  "23.....{NNNDD}" that means
that the EAN13 code will begin by '23', followed by 5 digits and after 5 others
digits to define the variable price. (EAN13 has a third char for control).

With this module, it is possible to:
- Affect a pattern (barcode.rule) to a product.product or a res.partner
- To generate an EAN13 depending on the defined pattern and a custom ID

Note
----
Dependency to point_of_sale is required because ean13 field, defined in 'base'
module (in the res.partner model), is defined in a point_of_sale view.

The same design error is present in odoo 9.0 with the renamed 'barcode' field.

It's a relative problem, because product barcodes generation will occures
mostly in a Point of Sale context.

You could comment 'point_of_sale' dependency if you use this module without
point of sale.

Copyright Note
--------------
Icon of the module is based on the Oxygen Team work and is under LGPL licence:

http://www.iconarchive.com/show/oxygen-icons-by-oxygen-icons.org.html


""",
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'barcodes',
        'point_of_sale',
    ],
    'data': [
        'security/res_groups.xml',
        'views/view_res_partner.xml',
        'views/view_product_product.xml',
        'views/view_barcode_rule.xml',
    ],
    'demo': [
        'demo/res_users.xml',
    ],
    'images': [
        'static/description/barcode_rule.png'
    ],
}
