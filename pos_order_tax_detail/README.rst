.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

Show taxes details in POS order
===============================

This module track list of taxes in a POS order. Then shows one line per tax
with its total amount in POS order PDF report.


Known issues / Roadmap
======================

As a POS order hasn't a mandatory partner, this addon computes taxes regardless
partner's fiscal position (if any). User can create an invoice from the
POS order if he wants to take care about partner's fiscal position.

**NOTICE**
If product taxes are changed while a POS session is opened, then incorrect
taxes will be computed and a warning will advice user about this problem


Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_order_tax_detail%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Rafael Blasco <rafabn@antiun.com>
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