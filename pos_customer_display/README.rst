.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

====================
POS Customer Display
====================

This module adds support for Customer Display in the Point of Sale. As incredible as it may seem, the Odoo POS doesn't have native support for a customer display, even on Odoo 10. So, if the customer cannot see the screen of the cashier, he will not be able to check the price of each product scanned by the cashier, he won't be able to see the total amount, etc. This module provides a solution to this problem by adding support for good old POS LCDs, which are often made of 2 lines of 20 caracters.

This module is designed to be installed on the *main Odoo server*. On the
*POSbox*, you should install the module *hw_customer_display*. But you will certainly prefer to use `pywebdriver <https://github.com/akretion/pywebdriver>`__ instead of the POSbox. Compared to the POSbox, Pywebdriver has several advantages:

* smaller footprint: no need to have a full-blown Odoo with PostgreSQL on the computer of the cashier (or his small Linux-based PC connected to the hardware, like the RaspberryPi for the POSbox),
* availability of an Ubuntu package, for easier deployment,
* native support for the customer display, payment terminal, etc.
* nice test/diagnosis Web interface.

It has been tested with a Bixolon BCD-1100
(http://www.bixolon.com/html/en/product/product_detail.xhtml?prod_id=61),
but should support most serial and USB-serial LCD displays
out-of-the-box or with minor adaptations in the source code:

* of the module *hw_customer_display* if you use the POSbox,
* or of the Python lib `pyposdisplay <https://github.com/akretion/pyposdisplay>`__ if you use `pywebdriver <https://github.com/akretion/pywebdriver>`__.

This module has been developped during a POS code sprint at
`Akretion France <http://www.akretion.com/>`_ from July 7th to July 10th 2014.

Configuration
=============

To configure this module, go to the menu *Point of Sale > Configuration > Point
of Sale* and edit the point of sale for which you want to enable the LCD:

* make sure you have configured the *IP address* and port of the POSbox or pywebdriver in the section *Hardware Proxy / PosBox*,
* activate the option *Customer Display*,
* configure the number of caracters on each line of your LCD (20 by default).

At the end of the page, in the *Customer Display* section, you can customize the *Next customer* message and the *POS closed* message.

Usage
=====

Once everything is configured, just start the POS as usual. You will see messages on the LCD when:

* you start the POS,
* you add or remove a product,
* you press the Payment button: the LCD will display the total amount,
* you enter the amount of cash you receive: the LCD will display the amount of the change to give back,
* you validate an order and go to the next customer,
* you close the POS.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/10.0

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

* Aurélien Dumaine
* Alexis de Lattre <alexis.delattre@akretion.com>
* Father Odilon (`Barroux Abbey <http://www.barroux.org/>`_)
* Daniel Kraft

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
