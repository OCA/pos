.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

POS Remove POS Category
=======================

This module was written to replace POS categories by product categories
in the point of sale.

Important notes
---------------
- When the module is installed the link beetween products and POS categories
  is **overwritten** by a link beetween products and product categories
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
You may uncheck 'Available in the Point of Sale' field
in regular product categories if you want that a category becomes invisible
in POS.
Children categories will becomes invisible too, whatever their checkbox state.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_remove_pos_category%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Sylvain Calador <sylvain.calador@akretion.com>
* Simone Orsi <simone.orsi@camptocamp.com>
* Cédric Pigeon <cedric.pigeon@acsone.eu>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
