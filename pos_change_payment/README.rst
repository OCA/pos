.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Improve payment changes when user did a mistake and disable some actions on POS
 Bank Statement Line
===============================================================================
====================

Functionality:
--------------
* Add the possibility to switch a POS payment (account.bank.statement.line)
  of a POS Order from a Journal to another. This feature is usefull when
  the user realized that he did a mistake, during the close of the session,
  or just after he marked the POS as paid;
  (Only if entries has not been generated)
* Add the possibility to change all payments (method and amount) of a POS;
  (Only if entries has not been generated)

Bug Fixes / Improvement:
------------------------
* In the pos.payment wizard, display only the payment methods defined in
  the current POS session;
* Disable the possibility to edit / delete a bank statement line on a POS
  Order that has generated his entries, except using the wizard of this
  module. This will prevent the generation of bad account move during
  the close of the session; (mainly unbalanced moves)
* All the cash payment are merged into a single one statement line. this
  feature is usefull if the user use OpenERP as a calculator, writing
  for a payment:
    * Payment 1/ Cash 50 €;
    * Payment 2/ Cash -3,56 €;
    * With this module, the final statement line is a single line
      Payment 1/ Cash 46,44 €

Usage
=====


Installation
============

Nothing special is needed to install this module.


Configuration
=============

No configuration needed.

Credits
=======

Contributors
------------

* Sylvain LE GAL (https://twitter.com/


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
