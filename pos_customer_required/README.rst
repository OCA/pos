.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3


=================================
Point Of Sale - Customer Required
=================================

This module was written to extend the functionality of odoo pos
and allows you to require a customer for each pos order.  In the
pos session configuration, you can choose to require the customer for pos
orders.

If a customer is not selected, the pos ui will display an error message.
In the backend the customer field is required when needed.

Two new options are available:

* Customer 'Required before starting the order';
* Customer 'Required before paying';

'Required before starting the order' Option
-------------------------------------------
In the frontend PoS, the default screen is the screen to select customers.

* Users are not allowed to start selling before having selected a customer;
* Users can not 'deselect a customer', only select an other one;

'Required before paying' Option
-------------------------------
In the frontend PoS, the user can start selling, but if the user tries to
make payment and if a customer is not selected, the pos ui will display an
error message.


.. image:: /pos_customer_required/static/description/frontend_pos_error_message.png

Configuration
=============

To configure this module, you need to:

* go to point of sale -> configuration -> point of sales
* select the point of sales you want configure
* search for the "Require Customer" and choose between the following values:
    * 'Optional'; (this module has no effect on this PoS config)
    * 'Required before paying';
    * 'Required before starting the order';

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
help us smashing it by providing a detailed and welcomed feedback.


Credits
=======

Contributors
------------

* Jos De Graeve <Jos.DeGraeve@apertoso.be>
* Sylvain LE GAL <https://twitter.com/legalsylvain>
* Pedro M. Baeza  <pedro.baeza@gmail.com> ( reviews & feedback )


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
