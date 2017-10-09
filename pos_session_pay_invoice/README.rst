.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
    :alt: License: LGPL-3

=======================
POS Session Pay invoice
=======================

This modules allows to pay an existing Supplier Invoice / Customer Refund, or
to collect payment for an existing Customer Invoice, from within a POS Session.

Installation
============

* In order to install this module, you will need to install first the
  module 'account_cash_invoice', available in https://github.com/OCA/account-payment/11.0

Configuration
=============
#.  Go to *Point of Sale / Configuration / Point of Sale* and activate the
    'Cash Control' setting.

Usage
=====

#.  Go to *Point of Sale / Dashboard* and create and open or access to an
    already open POS Session.
#.  Press the button **Pay Invoice** to pay a Supplier Invoice or a Customer
    Refund. It will be paid using Cash.
#.  Select **Collect Payment from Invoice** in to receive a payment of an
    existing Customer Invoice or a Supplier Refund. You will need to select
    a Journal if the POS Config has defined multiple Payment Methods.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/repo/github-com-oca-pos-184


Known issues / Roadmap
======================

* Cannot pay invoices in a different currency than that defined in the journal
  associated to the payment method used to pay/collect payment.


Credits
=======

Contributors
------------

* Enric Tobella <etobella@creublanca.es>
* Jordi Ballester <jordi.ballester@eficent.com>


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
