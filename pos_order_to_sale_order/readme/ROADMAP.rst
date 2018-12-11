* Because of the poor design of the Odoo Point of Sale, some basic features
  are not available by default, like pricelist, fiscal position, etc ...
  For that reason, unit price will be recomputed by default, when creating the
  sale order, and the unit price of the current bill will not be used.

Note that this problem is fixed if ``pos_pricelist`` is installed.
(same repository) In that cases, the pricelist, the unit prices and the taxes
will be the same in the order, as in the displayed bill.

.. figure:: ../static/description/pos_create_picking_confirm.png
   :width: 800 px
