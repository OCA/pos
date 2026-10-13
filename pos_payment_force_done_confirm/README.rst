===============================
POS Payment Force Done Confirm
===============================

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

|badge1| |badge2|

**POS Payment Force Done Confirmation** asks the cashier to confirm before using
**Force Done** on a payment line in the Point of Sale (for example when the
terminal flow was interrupted but the card was actually charged). The goal is to
limit accidental clicks that can desynchronize the POS with real card capture.

**Table of contents**

.. contents::
   :local:

Usage
=====

Install the module and open the POS. When you click **Force Done** on a payment
line, a dialog appears. Choose **No, go back** to cancel, or **Yes** to apply
**Force Done** as in standard Odoo.

Bug Tracker
===========

Bugs are tracked on GitHub Issues. In case of problems, please check there if
your issue has already been reported.

Credits
=======

Authors
~~~~~~~

* CHEF PIXEL

Maintainers
~~~~~~~~~~~

This module is maintained by its authors.

License
=======

This project is licensed under LGPL-3.0 or later
(`see <https://www.gnu.org/licenses/lgpl-3.0.html>`_).
