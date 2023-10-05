This module was written to extend the functionality of odoo pos
and allows you to require a invoice for each pos order.  In the
pos session configuration, you can choose to require the invoice for pos
orders.

If the invoice is not selected, the pos ui will display an error message.
In the backend the invoice is required when needed.

Two new options are available:

* No Invoice 'No Invoice is admitted for the pos order';
* Optional 'Optional Invoice when closing the pos order';
* Required 'Invoice is required when closing the pos order';

'No Invoice is admitted for the pos order'
------------------------------------------
In the frontend PoS, The invoice is not permitted for the current PoS.

'Optional Invoice when closing the pos order'
---------------------------------------------
In the frontend PoS, The invoice is optional for the current PoS.

'Invoice is required when closing the pos order'
------------------------------------------------
In the frontend PoS, The invoice is mandatory for the current PoS.
