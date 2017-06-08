.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Dynamic Price for Odoo Point of Sale
====================================

Motivation
----------

Many issues report this feature. This why I took decision to start this module

Reported issues :

`odoo 8 POS price list discount has no effect. <https://github.com/odoo/odoo/issues/3579>`_

`ODOO POS Pricelist - Public Price & Discounted Price in Receipt. <https://github.com/odoo/odoo/issues/1758>`_

`V8.0 pos gives wrong price when using min qty in pos pricelist <https://github.com/odoo/odoo/issues/2297>`_

Goal of the module
------------------

The goal of this module is to bring the pricelist computation engine to the POS.
This module loads all the necessary data into the POS in order to have a coherent behaviour (offline/online/backend).


Installation
============

Nothing special is needed to install this module.


Configuration
=============

You'll have new configuration parameters at Point of Sale > Configuration > Point of Sales

* Price with Taxes: Show prices with taxes in POS session or not


Usage
=====

Implemented features at POS Session
-----------------------------------

1.  Attached pricelist on partner will take effect on the POS, which means that if we attach a pricelist to a partner.
The POS will recognize it and will compute the price according to the rule defined.

2. Fiscal Position of each partner will also be present so taxes will be correctly computed
(conforming to the fiscal position).

- Implemented Rules are :

   1. (-1) : Rule based on other pricelist
   2. (-2) : Rule based on supplierinfo
   3. (default) : Any price type which is set on the product form

3. An new option is introduced in the POS config to let the user show price with taxes in product widget.
the UI is updated when we change the customer in order to adapt the prices.
The computation take in account the pricelist and the fiscal position of the customer

4. When we mouseover the price tag, a tooltip is shown to indicate the computation depending on the quantity like this output :
1x -> 100 €
3x -> 70 €
5x -> 50 €


Implemented features at backend
-------------------------------

1. Tax details

   - Tax details per order line
   - Tax details aggregated by tax at order level

2. Ticket

   - Tax details table added at end of printed ticket


Known issues / Roadmap
======================

Missing features
----------------

* As you may know, product template is not fully implemented in the POS, so I decided to drop it from this module.
* Applying a fiscal position on a product with inclusive taxes is not yet supported. In this case, the mapped taxes will be applied to the price incuding taxes.


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_pricelist%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Adil Houmadi <ah@taktik.be>
* Pablo Cayuela <pablo.cayuela@aserti.es>
* Antonio Espinosa <antonioea@antiun.com>


Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
