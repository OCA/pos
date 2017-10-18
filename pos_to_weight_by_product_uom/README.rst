.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

==============
Pos to weight by product
==============

Motivation
============

At the moment, when we create a new product and choose the unity of measure **kg**, 
we have to tick the checkbox 'To Weigh With Scale' in the Point of Sale part.

We want to speed the process of creating a new product, avoiding filling manually this parameter.

Brief presentation
============

This module adds the field **'To weigh'** in UOM categories (set to **false** by default).

.. image:: /pos_to_weight_by_product_uom/static/description/uom_categ_toweigh.png
   :alt: Categories of unities of measure
   :width: 900


**→** This field affects every unities contained in this category.

.. image:: /pos_to_weight_by_product_uom/static/description/uom_toweigh.png
   :alt: Unities of measure with field 'To weigh'
   :width: 900

**→** **AND** it is linked with the parameter **to_weight** in product.template used for example in the Point of Sale app. 

.. image:: /pos_to_weight_by_product_uom/static/description/uom_pos_change_toweigh_checked.png
   :alt: Change the field 'to weigh' for every product
   :width: 300

Installation
============

To install this module, you need to :

* install the official apps : Sales Management and Point of Sale
* install this module with the installation button
* active settings "Allow using different units of measure" in Settings > Configuration > Sales >  Quotations and Sales Orders >  Product Features

How to use this module
=============

* [Category UOM] During the creation of a category, tick the box 'To weigh'.

.. image:: /pos_to_weight_by_product_uom/static/description/uom_categ_change_toweigh.png
   :alt: Change the field 'To weigh' for every category
   :width: 400

* [Category UOM] You can set every product existing with the new 'To weigh' parameter

.. image:: /pos_to_weight_by_product_uom/static/description/uom_categ_button_toweigh.png
   :alt: Set 'to weigh' in each product of this category
   :width: 900

* [UOM] You **CAN'T** change 'To weigh' for one UOM → You have to change in Category and affect all UOM of this category.

.. image:: /pos_to_weight_by_product_uom/static/description/uom_change_toweigh.png
   :alt: Can't change the field 'to weigh' for one unity of measure
   :width: 900

* [Product] **However**, you're able to change this field for a specific product (in tab Sales).

.. image:: /pos_to_weight_by_product_uom/static/description/uom_pos_change_toweigh.png
   :alt: Change the field 'to weigh' for every product
   :width: 300

Usage
=====

* To use this module, you need to go to (link not avalaible yet):

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/{repo_id}/{branch}


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Quentin Dupont, GRAP <quentin.dupont@grap.coop> (http://www.grap.coop/)
* Sylvain Legal, GRAP <sylvain.legal@grap.coop> (http://www.grap.coop/)

Do not contact contributors directly about support or help with technical issues.

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
