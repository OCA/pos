This module was written to extend the functionality of odoo pos
and allows you to require a customer for each pos order.  In the
pos session configuration, you can choose to require the customer for pos
orders.

If a customer is not selected, the pos ui will display an error message.
In the backend the customer field is required when needed.

Two new options are available:

* Customer 'Required before starting the order';
* Customer 'Required before paying';

'Required before starting the order' Option
-------------------------------------------
In the frontend PoS, the default screen is the screen to select customers.

* Users are not allowed to start selling before having selected a customer;
* Users can not 'deselect a customer', only select an other one;

'Required before paying' Option
-------------------------------
In the frontend PoS, the user can start selling, but if the user tries to
make payment and if a customer is not selected, the pos ui will display an
error message.


.. image:: /pos_customer_required/static/description/frontend_pos_error_message.png
