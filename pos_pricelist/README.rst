.. image:: https://img.shields.io/badge/license-LGPL--3-blue.svg
   :target: https://www.gnu.org/licenses/lgpl
   :alt: License: LGPL-3

POS Pricelist
=============

Bring the pricelist computation engine to the Point of Sale.

Installation
============

You need this dependency::

    pip install oca.decorators

Configuration
=============

To configure a pricelist-enabled POS:

#. Go to *Point of Sale > Configuration > Point of Sale* and pick/create one.
#. Enable *Pricelists > Use pricelists*.
#. Set the *Available Pricelists* and choose a *Default Pricelist* from
   among them.
#. You can use the *Pricelists* button to manage them easily, in case you need
   more.
#. Save.

To see the effect, you should for instance apply the pricelist to a customer.

Usage
=====

#. Go to *Point of Sale > Dashboard* and open the POS session you configured.
#. Use the new pricelist button to change it on the fly.
#. When a new order is created, it always has the default pricelist.
#. When you change to a customer that has a different pricelist, the current
   order and the listed product prices are updated accordingly.

Known issues / Roadmap
======================

* This module is a backport from Odoo 11.0 core pricelist functionalities. As
  such, do not migrate it to that version or higher.
* Conflicts with ``pos_backend_partner`` make that when both are installed,
  changing the partner does not change the pricelist.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Adil Houmadi <ah@taktik.be>
* Pablo Cayuela <pablo.cayuela@aserti.es>
* Antonio Espinosa <antonioea@antiun.com>
* Odoo S.A.
* `Tecnativa <https://www.tecnativa.com>`_:
  * Jairo Llopis <jairo.llopis@tecnativa.com>

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
