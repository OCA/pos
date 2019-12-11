Select an PoS Order an choose either *Return Products* (full return of the
order) or *Partial Return*. In this case, a wizard allows to select just some
products and quantities to return:

.. image:: /pos_order_return/static/description/partial_return_wizard.png

Register the refund payment to finish the return. If the original order was
invoiced, a refund invoice will be made.

**Implemented Constraints**

* User can not return more products than the initial quantity:

.. image:: /pos_order_return/static/description/returned_qty_over_initial.png

* If a line has been partially refund, only a reduced quantity can be returned:

.. image:: /pos_order_return/static/description/sum_returned_qty_over_initial.png

* It is not possible to set a negative quantity if the initial Pos Order is
  not indicated:

.. image:: /pos_order_return/static/description/initial_pos_order_required.png
