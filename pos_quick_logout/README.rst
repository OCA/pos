.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

PoS - Quick Logout
==================

This module was written to extend the functionality of Odoo Point Of Sale about
changing of cashier.

This module add a simple button 'Log Out' available in Point Of Sale Front End
UI. This button is available when the cashier is not the initial user logged in
Odoo. It allows to log out quickly, wihout selecting again the user in the
list. This module is usefull for user that use regularly the change of cashier,
especialy with 'pos_access_right', when users doesn't have the right to do some
actions like set discount, change unit price, ...

Implemented Features
--------------------

* By default, the header is unchanged

.. image:: /pos_quick_logout/static/description/cashier_user_identical.png


* If the cashier changed, and is not the user logged in Odoo, the extra button
appears

.. image:: /pos_quick_logout/static/description/cashier_user_different.png


Installation
============

Normal installation.

Configuration
=============

No Configuration Needed.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
pos/issues/new?body=module:%20
pos_quick_logout%0Aversion:%20
9.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

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

