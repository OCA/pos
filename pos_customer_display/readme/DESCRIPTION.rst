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