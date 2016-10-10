.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

============================================
Generate Barcodes for Products and Customers
============================================

This module expends Odoo functionnality, allowing user to generate barcode
depending on a given barcode rule.

For exemple, a typical pattern for products is  "23.....{NNNDD}" that means
that:
* the EAN13 code will begin by '23' ;
* followed by 5 digits (named Barcode Base in this module, ) ;
* and after 5 others digits to define the variable price ;
* a 13 digit control

With this module, it is possible to:

* Affect a pattern (barcode.rule) to a product.product or a res.partner

* Generate the next Barcode base of a pattern. (to avoid duplicate barcode)
* Generate a barcode, based on a pattern and a barcode base

Configuration
=============

To configure this module, you need to:

* Go to Point Of Sale / Configuration / Barcode Nomenclatures and select
* Select a Nomenclature
* Create or select a rule
.. image:: /barcodes_generate/static/description/barcode_rule_tree.png

* Check 'Available for Products', or 'Available for Partners' Checkbox.

.. image:: /barcodes_generate/static/description/barcode_rule_form.png

Usage
=====

To use this module, you need to:

* Go to a Product form (or a Partner Form):
* set a rule to the current object

.. image:: /barcodes_generate/static/description/product_product_form_generate_base_barcode.png

* Click on 'Generate Base and Barcode'

.. image:: /barcodes_generate/static/description/product_product_form_generated.png


Alternatively you can set manually a barcode base, and click only on Generate barcode.

.. image:: /barcodes_generate/static/description/product_product_form_generate_barcode.png



.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Known issues / Roadmap
======================

Dependency to point_of_sale is required because barcode field, defined in 'base'
module (in the res.partner model), is defined in a 'point_of_sale' view.
Furthermore, barcode nomenclature menu is available on Point Of Sale submenu.

It's a relative problem, because product barcodes generation will occures
mostly in a Point of Sale context.

You could comment 'point_of_sale' dependencies if you want to use this module
without point of sale installed.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

* Icon of the module is based on the Oxygen Team work and is under LGPL licence:
  http://www.iconarchive.com/show/oxygen-icons-by-oxygen-icons.org.html

Contributors
------------

* Sylvain LE GAL (https://twitter.com/legalsylvain)

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.

