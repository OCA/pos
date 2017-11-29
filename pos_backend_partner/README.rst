.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License

POS Backend Partner
===================

Choose a POS customer from the backend.


- Replace customer selection screen in POS by a backend view.
- Perf improvement : Full customer list is not downloaded anymore by the POS at startup.
- Benefit from the backend features: advanced search, easy to extend views, etc.


.. figure:: ./static/description/pos_backend_partner_1.png
   :width: 800px


.. figure:: ./static/description/pos_backend_partner_2.png
   :width: 800px


.. figure:: ./static/description/pos_backend_partner_3.png
   :width: 800px




Warning about offline mode
--------------------------

Due to design of this module, you can't choose a _named customer_ while offline but you
can still register orders with _anonymous_ user.


Configuration
=============

On each client's browser, during the first run, the permission for opening popup is prompted, it should be allowed.


Roadmap
=======

- See pos_backend_communication

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/pos/issues/new?body=module:%20pos_backend_partner%0Aversion:%208.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


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
