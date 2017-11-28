.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

POS Backend Communication
=========================

Communicate with the backend from point of sale.

Common use case:
 - a click on a button on the pos opens the backend in a popup to a specific view.
 - a click on a button on the backend's view send to pos some interesting data.

Implementations
---------------

pos_backend_partner: select a pos customer from the backend


Configuration
=============

No configuration is needed.

Developper Guide
================

The POS communicate with subpages (popups) with [window.open](https://developer.mozilla.org/docs/Web/API/Window/open) and [window.postMessage](https://developer.mozilla.org/docs/Web/API/Window/postMessage) 

Popups are in not-so-old browsers opened in tabs.

When a backend page is open, a class is set on body to hide menus.


Roadmap
=======

- Improve origin verificiation
- Try to use frames instead of popups
- Use notifications for supported browsers

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_backend_communication%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Raphaël Reverdy <raphael.reverdy@akretion.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
