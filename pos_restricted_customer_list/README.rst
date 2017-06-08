.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

============================
POS Restricted Customer List
============================

In the point of sale, many installations work with cash registers with
anonymous customers. In that case, loading thousands, or even tens of
thousands of customers to each cash register is completely useless, and also
a huge danger for leaking privacy sensible data.

This module will limit the download of customer data to only those customers
where this has been specifically requested.

Technical information
=====================

The module will add a flag 'available_in_pos' to res.partner. It will override
to domain of customers downloaded with pos to only download the partners
where this flag has been set.

Roadmap
=======

I see two obvious extensions to the functionality already developed:
1. Add back on demand customer lookup (only when online);
2. Make customers available to pos, dependent on the pos session or user.
   In pos.config or res.users (or both) there could be a selection field
   customer_loading with values:
   - 'no_one': disable customer loading.
     (usefull for self service pos, without customer feature)
   - 'selection': the feature now implemented.
     (load only checked customers). (default value).
   - 'all': for super cashier, (after sale PoS), etc.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and
welcomed feedback.


Credits
=======

Contributors
------------

* Ronald Portier <ronald@therp.nl>


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
