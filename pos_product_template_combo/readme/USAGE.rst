To use this module, you need to:

#. Go to the product template registration and check the option "is_combo"

#. In the "Combo categories" tab that will appear, create a line for each desired combo category, following the following concepts:

* Options: For each desired option for the combo category, create a record containing the option name and point it to the desired product template

* Price: If the value is non-zero, it will be used for the order line price, regardless of the chosen product.If the value is zero, the price of the chosen product will be used.

* Max Qty: If the maximum quantity is equal to 1, the widget that will be used in the combo popup will only allow selecting one option from the category.If it is greater than one, a different widget will be used, which will make it possible to distribute the allowed amount among the available options of the category.
