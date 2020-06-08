* Open your Point of Sale

* Cashier can see the food products, eligible for meal voucher payment, and see the total for
  Meal Voucher amount

  .. figure:: ../static/description/front_ui_pos_order_screen.png

* go to the payment screen

A Meal Voucher Summary is available:

  .. figure:: ../static/description/front_ui_pos_payment_screen.png

If the amount received is too important, a warning icon is displayed

  .. figure:: ../static/description/front_ui_pos_payment_screen_summary.png

If the cashier try to validate the order, a warning is also display, asking confirmation

  .. figure:: ../static/description/front_ui_pos_payment_screen_warning.png

It is a non blocking warning, because we don't want to prevent an order to be done,
if products are not correctly set, or if a recent law changed the maximum amount that can
be used each day. (A recent case occured in France, during the Covid-19 pandemy)

Note
~~~~

A new barcode rule is available for Paper Meal Voucher of 24 chars:

``...........{NNNDD}........``

If you scan the following barcode ``052566641320080017000000``, a new payment line will be added, with an amount of 8,00€ (``00800``)
