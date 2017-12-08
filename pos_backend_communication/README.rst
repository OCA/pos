.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

=========================
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

The POS communicate with subpages (popups) with window.open and window.postMessage. 

Popups are in not-so-old browsers opened in tabs.

When a backend page is open, a class is set on body to hide menus.


Roadmap
=======

- Improve origin verificiation
- Try to use frames instead of popups
- Use notifications for supported browsers

Known limitation
================

- It doesn't work offline.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.



Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* Raphaël Reverdy <raphael.reverdy@akretion.com> http://akretion.com

Do not contact contributors directly about support or help with technical issues.

Funders
-------

The development of this module has been financially supported by:

* Akretion

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
