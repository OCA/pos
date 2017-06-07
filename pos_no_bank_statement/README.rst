.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

POS No Bank Statement
=====================

This module allows user make POS Payment Method (Account Journal) not to create
Bank Statement Lines. This also means that no Journal Entries is going to be
created. One possible usage of the module is when products are sold only by
issuing an Invoice without registering any payment.

Usage
=====

* Create new Account Journal (e.g. "On Debt") marked as "PoS Payment Method" and
  "No Bank Statement"
* That's it. Selecting this payment method in POS no Bank Statemenet Lines will
  be created

Credits
=======

Contributors
------------

* Andrius Preimantas <andrius@versada.lt>

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
