This module extends the functionnality of Odoo PoS adding extra
checks, when opening session, to ensure that accounting configation
is correct.

Use case 1
~~~~~~~~~~

When we create a payment method and if:
- the field 'Outstanding Payment' is not set on payment method
- AND the field 'Outstanding Receipts Account' is not on company

if we use the payment method in the Point of sale, it is not
possible to close the session after.

.. image:: ../static/img/error_oustanding_payment.png

As it not possible to change a payment method when a session
is not closed, this bad configuration has to be fixed by SQL.

This module adds a check when opening session, to avoid such situation.
