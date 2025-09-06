===============================
POS Order Datepicker Filter
===============================

.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
   :target: https://odoo-community.org/page/development-status
   :alt: Maturity: Beta

.. |badge2| image:: https://img.shields.io/badge/odoo-18.0-a24689.png
   :target: https://www.odoo.com
   :alt: Odoo Version 18.0

|badge1| |badge2|

Overview
--------
This module extends the **Odoo Point of Sale (POS)** order management screen by 
adding a **datepicker filter**.  

With this feature, users can quickly filter and search POS orders not only 
by existing filters (customer, cashier, status, etc.) but also by a specific date.

Features
--------
* Adds a **datepicker widget** next to the POS order filter bar.
* Allows users to filter orders by **exact date**.
* Works seamlessly with other POS filters.
* Prevents selecting **future dates**.
* Fully integrated in **Odoo 18 POS** UI.

Installation
------------
1. Clone the repository into your Odoo addons path:

      git clone https://github.com/rahulpatel333/pos-order-datepicker.git

2. Update the Odoo apps list.
3. Install the module **POS Order Datepicker Filter** from Apps.

Configuration
-------------
No special configuration required.  
Once installed, you will see a **datepicker** beside the POS order filters.

Usage
-----
1. Go to **Point of Sale → Orders**.
2. Use the search bar and filters as usual.
3. Select a **date from the datepicker** to view only the orders from that date.

Screenshots
-----------
.. image:: /pos_order_datepicker/static/description/screenshot.png
   :alt: POS Order Datepicker Example
   :width: 80%

Bug Tracker
-----------
Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
If you encounter problems, please log them there.

Credits
-------

**Author & Contributor**
- Rahul Patel <ra.rp192@gmail.com>

Maintainer
-----------
This module is part of the OCA/pos project.

You are welcome to contribute.  
Check the OCA guidelines at https://odoo-community.org/page/maintainer-guidelines
