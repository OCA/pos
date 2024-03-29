========================
Point of Sale - New Line
========================

.. 
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !! This file is generated by oca-gen-addon-readme !!
   !! changes will be overwritten.                   !!
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !! source digest: sha256:61cf1d3fd3db01cf12ea835c5528ea0f84b0ab15eb17c0d5540f4b38f9f01df3
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3
.. |badge3| image:: https://img.shields.io/badge/github-OCA%2Fpos-lightgray.png?logo=github
    :target: https://github.com/OCA/pos/tree/16.0/pos_order_new_line
    :alt: OCA/pos
.. |badge4| image:: https://img.shields.io/badge/weblate-Translate%20me-F47D42.png
    :target: https://translation.odoo-community.org/projects/pos-16-0/pos-16-0-pos_order_new_line
    :alt: Translate me on Weblate
.. |badge5| image:: https://img.shields.io/badge/runboat-Try%20me-875A7B.png
    :target: https://runboat.odoo-community.org/builds?repo=OCA/pos&target_branch=16.0
    :alt: Try me on Runboat

|badge1| |badge2| |badge3| |badge4| |badge5|

This module extends the functionality of point of sale module, to allow to force
Point of sale to create a new order line, when selecting a product previously selected.

That can be usefull, if you want to sale the same product with different prices
and or discount. For exemple :

- You sell carrots, and some carrots are quite old, and you want to
  apply discount to a part of the products. (but not all the product)

- You want to manually apply some discount like :
  "2 Coca cola sold, the third will have a 10% discount".

**Table of contents**

.. contents::
   :local:

Usage
=====

* Open the Point of sale

* Select a product

* Click on 'New line'

.. figure:: https://raw.githubusercontent.com/OCA/pos/16.0/pos_order_new_line/static/description/new_line_button.png

* Select again the same product

* A new line will be created.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us to smash it by providing a detailed and welcomed
`feedback <https://github.com/OCA/pos/issues/new?body=module:%20pos_order_new_line%0Aversion:%2016.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Do not contact contributors directly about support or help with technical issues.

Credits
=======

Authors
~~~~~~~

* GRAP

Contributors
~~~~~~~~~~~~

* Sylvain LE GAL (https://twitter.com/legalsylvain)

Other credits
~~~~~~~~~~~~~

The development of this module has been financially supported by:

* UGESS, Union Nationale des Groupements des épiceries Sociales et Solidaires (https://ugess.org/)

Maintainers
~~~~~~~~~~~

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

.. |maintainer-legalsylvain| image:: https://github.com/legalsylvain.png?size=40px
    :target: https://github.com/legalsylvain
    :alt: legalsylvain

Current `maintainer <https://odoo-community.org/page/maintainer-role>`__:

|maintainer-legalsylvain| 

This module is part of the `OCA/pos <https://github.com/OCA/pos/tree/16.0/pos_order_new_line>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
