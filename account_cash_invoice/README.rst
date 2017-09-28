.. image:: https://img.shields.io/badge/licence-LGPL--3-blue.svg
    :alt: License: LGPL-3

===============
PoS Pay invoice
===============

This modules allows to pay an existing Supplier Invoice / Customer Refund, or
to collect payment for an existing Customer Invoice, using the PoS
backend session.


Usage
=====

#.  Go to *Point of Sale / Dashboard* and create and/or open an existing
    Session.
#.  Press the button **Pay Invoice** to pay a Supplier Invoice or a Customer
    Refund. You will need to select the expected Journal
#.  Select **Collect Payment from Invoice** in to receive a payment of an
    existing Customer Invoice or a Supplier Refund.

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
