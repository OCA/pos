To configure this module, you need to:

#. Go to Warehouse / Configuration / Types of Operation
#. Select the picking type(s) you want to see in the point of sale
#. Check the box 'Available in Point of Sale'

.. figure:: ../static/description/stock_picking_type_form.png
   :width: 800 px

Note: This box is NOT enabled by default except in demo data for the type
'Delivery Orders' of the demo company 'YourCompany'.

#. Go to Point of Sale / Configuration / Point of Sales
#. Select the Point(s) of Sales witch those you want to enable the feature
#. Check the box 'Load Pickings'
#. Set the max quantity of pickings you want to load

.. figure:: ../static/description/pos_config_form.png
   :width: 800 px

Note: This box is enabled by default

**Technical Notes**

* By default, the Point of Sale will display only the pickings if the state is
  in  'Waiting Availability', 'Partially Available' or 'Ready to Transfer'.

You can change this filter by overloading the ``_prepare_filter_for_pos``
function of the model ``stock.picking``.

* By default, the search of pickings will be done on the fields ``name``,
  ``origin`` and ``partner_id`` of the picking.

You can change this feature by overloading the
``_prepare_filter_query_for_pos`` function of the model ``stock.picking``.

* By default, when the PoS order is confirmed, the original picking is
  cancelled and the sale order is set to the state 'Done'.

You can change this behaviour by overloading
``_handle_orders_with_original_picking`` function of the model ``pos.order``.
