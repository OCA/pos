.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

POS Trade Receivable Autoreconcile
==================================

This module reconciles "Trade Receivable" record created on Customer account
with Payments made by this customer.

Example:

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

Usage
=====

* Install the module. No configuration needed.

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
