Dynamic Price for Odoo Point of Sale
------------------------------------

### Motivation :

Many issues report this feature. This why I took decision to start this module

Reported issues :

###<a href="https://github.com/odoo/odoo/issues/3579">odoo 8 POS price list discount has no effect.</a>
###<a href="https://github.com/odoo/odoo/issues/1758">ODOO POS Pricelist - Public Price & Discounted Price in Receipt</a>
###<a href="https://github.com/odoo/odoo/issues/2297">V8.0 pos gives wrong price when using min qty in pos pricelist</a>

### Goal of the module :

The goal of this module is to bring the pricelist computation engine to the POS.
This module loads all the necessary data into the POS in order to have a coherent behaviour (offline/online/backend).

### Implemented features : 

- Attached pricelist on partner will take effect on the POS, which means that if we attach a pricelist to a partner.
The POS will recognize it and will compute the price according to the rule defined.

- Fiscal Position of each partner will also be present so taxes will be correctly computed 
(conforming to the fiscal position).

- Implemented Rules are :
  1. (-1) : Rule based on other pricelist<br/>
  2. (-2) : Rule based on supplierinfo<br/>
  3. (default) : Any price type which is set on the product form<br/>

### Missing features :

- As you may know, product template is not fully implemented in the POS, so I decided to drop it from this module.