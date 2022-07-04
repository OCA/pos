.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

====================
POS Product Template
====================


    * In Point Of Sale Front End - Products list:
        * Display only one product per template;
        * Display template name instead of product name;
        * Display products quantity instead of price;
        * Click on template displays an extra screen to select Variant;

    * In Point Of Sale Front End - Variants list:
        * Display all the products of the selected variant;
        * Click on a attribute value filters products;
        * Click on a product adds it to the current Order or display normal
          extra screen if it is a weightable product;


Usage
=====

Open the Point of Sale, search an article with variants.
You will see one article instead of all the variants.

#. Go to ...

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/pos/10.0


Known issues / Roadmap
======================

* Templates with lot of variants are not shown. See https://github.com/OCA/pos/pull/135


Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* Sylvain LE GAL (https://twitter.com/legalsylvain)
* Navarromiguel (https://github.com/navarromiguel)
* Damendieta (https://github.com/damendieta)
* Raphaël Reverdy (https://akretion.com)
* Pedro Guirao (https://ingenieriacloud.com)

Do not contact contributors directly about support or help with technical issues.

Funders
-------

The development of this module has been financially supported by:

* Akretion


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
