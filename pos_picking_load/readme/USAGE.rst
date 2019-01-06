To use this module, you need to:

* Launch the point of sale
* On a new order (without lines), click on the 'Load Picking' button.

.. figure:: ../static/description/load_picking_01_load_button.png
   :width: 800 px

* Point of sale will load available pickings. (About displayed pickings, see
  'Technical Notes' section).

.. figure:: ../static/description/load_picking_02_picking_list.png
   :width: 800 px

* Click on a picking will check if the picking is loadable and if yes, will
  display a 'Select' button. (See 'Possible Warnings' Section)

.. figure:: ../static/description/load_picking_03_confirm.png
   :width: 800 px

* Confirm the selection, by clicking on 'Select' button. It will display
  the content of the moves (as PoS Order Lines)

.. figure:: ../static/description/load_picking_04_pos_order.png
   :width: 800 px

The price and the discount will be the sale price and the discount set in
the according Sale Order Line, if it was found. Otherwise, discount will be
set to 0, and unit price will be the unit price of the product when it has been
loaded in the Point of Sale.

**Related Sale Order:**

.. figure:: ../static/description/load_picking_sale_order.png
   :width: 800 px

**Related Picking:**

.. figure:: ../static/description/load_picking_stock_picking.png
   :width: 800 px


* Finally, you can add / remove products or change quantity and collect the
  payment.

When, the order is marked as paid, the original picking will be cancelled,
because Point Of Sale generates a new picking related to the real delivered
products and the original Sale Order will pass to the state 'Done'. (Delivery
exception is ignored).
(See 'Technical Notes' section).

**Possible Warnings**

Some warning messages can appear:

* if some products are not available in the Point of Sale

.. figure:: ../static/description/load_picking_warning_product.png
   :width: 800 px

* if the partner is not available in the Point of Sale

.. figure:: ../static/description/load_picking_warning_partner.png
   :width: 800 px

* if the picking has been still loaded in another PoS order

.. figure:: ../static/description/load_picking_warning_picking_still_loaded.png
   :width: 800 px
