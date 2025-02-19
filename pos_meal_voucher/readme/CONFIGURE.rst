Products
~~~~~~~~

On a product form, in the "Sales" tab, the "Can be Paid for by Meal Vouchers" checkbox controls whether the product can be paid for by meal vouchers.

.. figure:: ../static/description/product_product_form.png

Product categories can be configured to have a default value for the "Can be Paid for by Meal Vouchers" field for its products.
The "Apply to All Products" button allows to set the value on all products of the category.

.. figure:: ../static/description/product_category_form.png

Point of Sale Payment Methods
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Point of sale payment methods (Point of Sale > Configuration > Payment Methods) have a "Meal Voucher Type" field that defines what type of meal voucher payment method they are:

* (empty): The payment method is not a meal voucher payment method.
* **Paper**: The payment method will be used when scanning meal voucher barcodes.
* **Electronic**: The payment method will be used for electronic meal vouchers.

.. figure:: ../static/description/pos_payment_method_form.png

Settings
~~~~~~~~

This module adds a "Meal Vouchers" section in the point of sale settings (Point of Sale > Configuration > Settings, or Settings > Point of Sale) with several options:

* **Maximum Amount**: Optional maximum amount per order that can be paid by meal vouchers. Set to 0 to disable.
* **Icon on Order Lines**: Whether to display an icon on point of sale order lines (on the product screen) for products that can be paid for by meal vouchers.
* **Information on Receipt**: Whether to display an asterisk (*) on receipts before each product that can be paid for by meal vouchers as well as the total eligible amount.

.. figure:: ../static/description/pos_settings.png
