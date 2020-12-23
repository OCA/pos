This module extends the functionality of Point of Sale Restaurant to
handle correctly ``note`` field.

By default, once ``pos_restaurant`` is installed, a warning is done,
when a pos order is created via the ``create_from_ui`` function.

With this module, the ``note`` field is stored in database.

It will avoid incorrect warning in the odoo logs:

.. code:: shell

    2020-12-22 20:33:40,567 31378 WARNING point_of_sale odoo.models: pos.order.line.create() with unknown fields: note
    2020-12-22 20:33:40,578 31378 WARNING point_of_sale odoo.models: pos.order.line.create() with unknown fields: note
    2020-12-22 20:33:40,585 31378 WARNING point_of_sale odoo.models: pos.order.line.create() with unknown fields: note
