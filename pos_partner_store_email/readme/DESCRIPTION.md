On the POS receipt screen, the cashier can type an email address to send the
receipt to the customer.

By default Odoo only keeps that address on the order itself
(`pos.order.email`); the customer record is left unchanged.

This module stores the emailed address on the customer (`res.partner.email`),
so the next order for that customer prefills it automatically.

When the entered address differs from the one stored on the customer, the
receipt screen shows a "Do not update the current email" checkbox, allowing
the cashier to opt out for that particular receipt.
