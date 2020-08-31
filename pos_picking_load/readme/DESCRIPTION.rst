This module extends the functionality of point of sale to allow you to
load your pickings in the Point of Sale, in order to add / remove products
and so create a PoS Order and mark it as paid.

**Detailled Use Case**

This module is usefull for the following use case

* You have many Sale Orders that have generated pickings. Typically if you have
  connected your Odoo instance to an online store like Shop Invader,
  Prestashop, Magento, or if you use light Odoo shop (``website_sale``
  module).
* Once the order validated, you prepare your pickings
* The customer come in your shop to recover his order
* the customer add (or remove) some products
* the customer pay his order, based on the real delivered products list
