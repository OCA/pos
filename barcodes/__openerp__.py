# -*- coding: utf-8 -*-
# Copyright (C) 2004-Today Odoo S.A.
# License LGPLv3 (https://github.com/odoo/odoo/blob/9.0/LICENSE).

{
    'name': 'Barcodes',
    'version': '8.0.2.0.0',
    'category': 'Extra Tools',
    'summary': 'Barcodes Scanning and Parsing',
    'description': """
This module adds support for barcode scanning and parsing.

Backport Note
-------------
This module is a backport of Odoo 9.0 modules. It has been done to have
a module in V8 that have the same models barcode, nomenclatures, rules than
in V9.0 and same rules (same xml_ids).

Data comes from stock, point_of_sale and barcodes V9.0 modules.

The following changes has been done:
- copyright has been added to Odoo SA in the header and licence LGPLv3 has been mentionned
- noqa has been set for all py files, to avoid to break OCA rules checked by Travis

The following features has not been backported
- JS features. See views/templates.xml for mor details.

Scanning
--------
Use a USB scanner (that mimics keyboard inputs) in order to work with barcodes in Odoo.
The scanner must be configured to use no prefix and a carriage return or tab as suffix.
The delay between each character input must be less than or equal to 50 milliseconds.
Most barcode scanners will work out of the box.
However, make sure the scanner uses the same keyboard layout as the device it's plugged in.
Either by setting the device's keyboard layout to US QWERTY (default value for most readers)
or by changing the scanner's keyboard layout (check the manual).

Parsing
-------
The barcodes are interpreted using the rules defined by a nomenclature.
It provides the following features:
- Patterns to identify barcodes containing a numerical value (e.g. weight, price)
- Definition of barcode aliases that allow to identify the same product with different barcodes
- Support for encodings EAN-13, EAN-8 and UPC-A

""",
    'depends': ['web', 'stock', 'point_of_sale'],
    'data': [
        'data/barcodes_data.xml',
        'data/default_barcode_patterns.xml',
        'barcodes_view.xml',
        'security/ir.model.access.csv',
        # 'views/templates.xml',
    ],
    'installable': True,
    'auto_install': False,
}
