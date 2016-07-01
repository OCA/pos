# -*- encoding: utf-8 -*-
#   Copyright 2016 SDI Juan Carlos Montoya <jcmontoya@sdi.es>
#   Copyright 2016 SDI  Javier Garcia   <jgarcia@sdi.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Invoice Auto Reconcile",
    "version": "8.0.0.1.0",
    "author": "Juan Carlos Montoya,"
              "Javier Garcia,"
              "Odoo Community Association (OCA)",
    "website": "http://sdi.es",
    "license": "AGPL-3",
    "category": "POS",
    'summary': """
        - Automatically Reconcile invoiced POS orders
    """,
    "depends": [
        'point_of_sale',
    ],
    "installable": True,
}
