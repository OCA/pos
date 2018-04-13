.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

====================
Pos Fix Search Limit
====================

This module makes the distinction between the limit of search results
and the limit of product displayed.

Without this module, if you have many products, all the searches are limited
to 100 firsts results.

This module increase the limit of search results to a high number
and keep the number of product displayed to 100.


Usage
=====

This module is a dependecy of other modules like pos_product_template.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/10.0

Known issues / Roadmap
======================

* Display a last element like "More products" to let the user know his search has been truncated.
* Truncate the list of partners with the display limit.

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

* Raphaël Reverdy <raphael.reverdy@akretion.com> (https://www.akretion.com)

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
