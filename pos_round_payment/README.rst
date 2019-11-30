Point Of Sales Round Payment
============================

Allow to round payment method to 5 cents.
You can choose to round only the cash payment or all the payment method. You
need to enable the feature on the payment journal.
Rounding only occurs for B2C (i.e. if partner does not have a VAT number).

The pos order will be marked as paid with a difference between the total and
paid amount. When reconciling the posted entries after the end of the pos
session, the difference must be written on a write-off account.

Installation
============

To install this module, you just need to select the module and insure yourself dependencies are available.

Configuration
=============

No configuration to use this module.

Credits
=======

Contributors
------------

* Jacques-Etienne Baudoux <je@bcim.be> (BCIM sprl)

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
