**Note**

In the javascript file, we could write

.. code-block:: javascript

    const PosDiscountAllOrder = () =>
        class extends Order {
        }

However, this code doesn't work if ``pos_sale`` module is installed. For that
reason we code the declaration as Odoo does, and add eslint exception.


.. code-block:: javascript

    // eslint-disable-next-line no-shadow
    const PosDiscountAllOrder = (Order) =>
        // eslint-disable-next-line no-shadow
        class PosDiscountAllOrder extends Order {
        }
