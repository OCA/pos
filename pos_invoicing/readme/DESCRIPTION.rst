When you pay a pos_order, and then create an invoice :

* you mustn't register a payment against the invoice as the payment
  already exists in POS
* The POS payment will be reconciled with the invoice when the session
  is closed
* You mustn't modify the invoice because the amount could become
  different from the one registered in POS. Thus we have to
  automatically validate the created invoice

Functionality
-------------
About the invoices created from POS after payment:

* automatically validate them and don't allow modifications
* Disable the Pay Button
* Don't display them in the Customer Payment tool

Technically
-----------

add a ``pos_pending_payment`` field on the ``account.invoice`` to mark the
items that shouldn't be paid.

.. figure:: ../static/description/account_invoice_form.png
