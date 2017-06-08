.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

===============================
Point of Sale - Price to Weight
===============================

This module extends Odoo Point Of Sale features, to allow to scan barcode
with price and to compute according quantity.

In Odoo by default, there are three types of barcode rules for products.

* 'Unit Product' (type='product'). Scanning a product will add a unit of this
  product to the current order.
* 'Priced product' (type='price'). A price is extracted from the barcode, and
  a new line with the given price and a quantity = 1 is added to the current
  order.
* 'Weighted product' (type='weight). A weight is extracted from the barcode,
  and a new line with the given weight, and a computed price
  (quantity * Unit price) is added to the current order.

This module add a new option:

* 'Priced Product (Computed Weight)' (type='price_to_weight'). A price is 
  extracted from the barcode, and a new line with the given price, and a
  computed quantity (Price / Unit Price) is added to the current order.

.. image:: /pos_price_to_weight/static/description/barcode_rule.png
   :width: 800 px

This module is usefull in shops with products scaled, to manage correctly
stock quantities.

Samples

* Given a product with a unit price of 1,50€ / kg
* The barcode is 0212345{NNNDD}x where:
    * 02 is the prefix of the barcode rule
    * 12345 is the product number
    * {NNNDD} is the price of the scaled product
    * x is the control digit

if {NNNDD} is 00265, the price is so 2,65€ and the according quantity is 
2,65€ / 1,5 €/kg = 1,767 kg

.. image:: /pos_price_to_weight/static/description/pos_test_1.png
   :width: 800 px

if {NNNDD} is 00810, the price is so 8,10€ and the according quantity is 
8,10€ / 1,5 €/kg = 5,400 kg

.. image:: /pos_price_to_weight/static/description/pos_test_2.png
   :width: 800 px


Configuration
=============

* Go to 'Point of Sale' / 'Configuration' / 'Barcode Nomenclatures'
* Edit your barcode rules, according to your barcodes settings

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

Icon parts come from http://icons8.com

Contributors
------------

* Sylvain LE GAL <https://twitter.com/legalsylvain>


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
