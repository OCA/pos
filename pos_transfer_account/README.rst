.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

PoS - Custom Transfer Account
=============================

This module was written to extend the functionality of odoo Point Of Sale about
transfer account.

This module is usefull only in a multi Point of Sale context of multi company
context.

With this module, it is now allowed to define for each PoS config a transfer
account.

If this account is set, it will be used when user realizes "Put Money In" or
"Take Money Out" operation, instead of the default one set in 'Invoicing' /
'Configuration' / 'Setting' Section. ("Inter-Banks Transfer Account" field)

Note
====

You could be interested by another OCA module 'pos_cash_move_reason'.

Installation
============

Normal installation.

Configuration
=============

* Go to 'Point of Sale' / 'Configuration' / 'Point of Sale'
* Edit your PoS  Config and add a custom account

.. image:: /pos_transfer_account/static/description/pos_config.png

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Sylvain LE GAL <https://twitter.com/legalsylvain>

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
