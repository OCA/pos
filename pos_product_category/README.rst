.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

POS Product Category
====================

This module was written to replace POS categories by product categories.

Important notes:
- When the module is installed the link beetween products and POS categories
  is **overwritten** by a link beetween product categories
  (the link is the field pos_categ_id in the table product_template)
- When the module is uninstalled the link beetween products and POS categories
  is restored in an **empty** state (NULL values)

Installation
============

This module depends on the `point_of_sale` Odoo official module.

Configuration
=============

No configuration is needed just use product categories as standard
pos categories.

Credits
=======

Contributors
------------

* Sylvain Calador <sylvain.calador@akretion.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
