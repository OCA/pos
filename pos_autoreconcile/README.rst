.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=================
POS Autoreconcile
=================

Module reconciles Invoices and "Trade Receivable" records with payments made by
related Customer.

Example of "Trade Receivable" reconciliation:

* Product costs 8EUR but customer pays 10EUR by cash getting 2EUR in return.
In accounting it looks like this:

1) D: cash: 10
2) C: account_receivable: 10

3) D: account_receivable: 2
4) C: cash: 2

* When closing & validating a session system would create "Trade Receivable"
counterpart like this:

5) D: account_receivable: 8
6) C: income_account: 8

When this module is installed 2), 3) and 5) items would be reconciled when
closing a session.

Module also grants access rights for POS users to create reconciliation records

Installation
============

To install this module, you need to:

* Click on Install button

Configuration
=============

No additional configuration is needed.

Usage
=====

To use this module, you need to:

* operate your POS as usual

For further information, please visit:

* https://www.odoo.com/forum/help-1

Known issues / Roadmap
======================

* No bugs reported

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_trade_receivable_autoreconcile%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Andrius Preimantas <andrius@versada.lt>

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