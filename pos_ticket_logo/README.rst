.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: AGPLv3 License

POS Ticket logo
===============

Add company logo in POS ticket


Motivation
==========

```XmlReceipt``` Qweb report is used when ```iface_print_via_proxy``` config is **True**:
https://github.com/odoo/odoo/blob/8.0/addons/point_of_sale/static/src/js/screens.js#L1341

But in the case ```iface_print_via_proxy``` config is **False**, ```PosTicket```
Qweb report is used, and company_logo is not used:
https://github.com/odoo/odoo/blob/8.0/addons/point_of_sale/static/src/js/screens.js#L984

In other hand, company_logo is loaded using ```/web/binary/company_logo``` controller that returns a 150px wide logo:
https://github.com/odoo/odoo/blob/8.0/addons/point_of_sale/static/src/js/models.js#L371
but after that logo is resized to 300px width, so a pixelled logo appears even
original logo is 300px wide.
That's why we override how company_logo is loaded. We also resized it to 260px
(not 300px) wide because appears cut in PDF:


Credits
=======

Contributors
------------

* Antonio Espinosa <antonioea@antiun.com>
* Endika Iglesias <endikaig@antiun.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
