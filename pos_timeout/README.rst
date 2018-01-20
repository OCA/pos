.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=======================
Point of Sale - timeout
=======================

This module extends the functionality of Point of Sale module.

By default, in Odoo a timeout is set to 7.5 seconds for the creation of
a PoS order. This threshold is usually sufficient, but in some cases it is not,
mainly if the connection is bad, or if some custom modules add extra
long treatments.

This module allows to change this default value.


Configuration
=============

To configure this module, you need to:

* Go to 'Point Of Sale' / 'Configuration' / 'Point of Sale' and edit your
  PoS Config, setting a timeout

.. figure:: /pos_timeout/static/description/pos_config.png
   :alt: PoS Configuration
   :width: 800 px

If not set, the default Odoo timeout will be used. (7.5 seconds in V10.0)

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/121/10.0

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

* Sylvain LE GAL (https://twitter.com/legalsylvain)

Funders
-------

The development of this module has been financially supported by:

* GRAP, Groupement Régional Alimentaire de Proximité (http://www.grap.coop)

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
