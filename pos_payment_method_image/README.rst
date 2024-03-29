====================================
Point of Sale - Payment Method Image
====================================

.. 
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !! This file is generated by oca-gen-addon-readme !!
   !! changes will be overwritten.                   !!
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !! source digest: sha256:5d5756c5387f8f4f107c7d0471e83a7a4f218ec2e5992542be34e16876c1caaa
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/licence-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3
.. |badge3| image:: https://img.shields.io/badge/github-OCA%2Fpos-lightgray.png?logo=github
    :target: https://github.com/OCA/pos/tree/16.0/pos_payment_method_image
    :alt: OCA/pos
.. |badge4| image:: https://img.shields.io/badge/weblate-Translate%20me-F47D42.png
    :target: https://translation.odoo-community.org/projects/pos-16-0/pos-16-0-pos_payment_method_image
    :alt: Translate me on Weblate
.. |badge5| image:: https://img.shields.io/badge/runboat-Try%20me-875A7B.png
    :target: https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=16.0
    :alt: Try me on Runboat

|badge1| |badge2| |badge3| |badge4| |badge5|

This module extends the functionality of point of sale to display images
for each journal available in the Point of Sale.

* The images are available in the payment screen

.. figure:: https://raw.githubusercontent.com/OCA/pos/16.0/pos_payment_method_image/static/description/pos_payment.png

**Table of contents**

.. contents::
   :local:

Configuration
=============

To configure this module, you need to:

* Go to 'Point Of Sale' / 'Configuration' / 'Payment Methods'

* Select a payment method

.. figure:: https://raw.githubusercontent.com/OCA/pos/16.0/pos_payment_method_image/static/description/pos_payment_method_form.png


Note:

If there is no image defined, default image will be set, depending
on the configuration (cash, customer wallet, bank)

Known issues / Roadmap
======================

* Do not port this module in V17+, because the feature become native at this release.
  See : https://github.com/odoo/odoo/pull/109446

* write migration scripts from ``pos_journal_image`` (V12) to ``pos_payment_method_image`` (V16).

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us to smash it by providing a detailed and welcomed
`feedback <https://github.com/OCA/pos/issues/new?body=module:%20pos_payment_method_image%0Aversion:%2016.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Do not contact contributors directly about support or help with technical issues.

Credits
=======

Authors
~~~~~~~

* Odoo SA
* GRAP

Contributors
~~~~~~~~~~~~

* Sylvain LE GAL <https://twitter.com/legalsylvain>

Most of the code comes from Odoo SA <http://www.odoo.com>.

(https://github.com/odoo/odoo/pull/109446)

Maintainers
~~~~~~~~~~~

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

.. |maintainer-legalsylvain| image:: https://github.com/legalsylvain.png?size=40px
    :target: https://github.com/legalsylvain
    :alt: legalsylvain

Current `maintainer <https://odoo-community.org/page/maintainer-role>`__:

|maintainer-legalsylvain| 

This module is part of the `OCA/pos <https://github.com/OCA/pos/tree/16.0/pos_payment_method_image>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
