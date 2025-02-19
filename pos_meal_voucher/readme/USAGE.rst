Product Screen
~~~~~~~~~~~~~~

On the product screen, the products that can be paid for by meal vouchers are (optionally) identified with an icon and the total amount of those products is displayed.

.. figure:: ../static/description/pos_order_screen.png

Payment Screen
~~~~~~~~~~~~~~

On the payment screen, a meal voucher summary is displayed:

.. figure:: ../static/description/pos_payment_screen_meal_vouchers.png

If the received amount is too high, a warning icon is displayed:

.. figure:: ../static/description/pos_payment_screen_warning.png

Receipt
~~~~~~~

The receipts can optionally contain information about the products that can be paid for by meal vouchers and the total amount of those products:

.. figure:: ../static/description/receipt_information.png

Barcodes
~~~~~~~~

A new barcode rule is defined for paper meal vouchers (with 24 characters):

``...........{NNNDD}........``

If you scan the following barcode: ``052566641320080017000000``, a new payment line with an amount of ¤8.00 (``00800``) will be added.
