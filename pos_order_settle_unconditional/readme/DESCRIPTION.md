The POS *Quotation/Order* button lists the sale orders a cashier can settle.
Odoo restricts that list to orders with an amount left to pay, and
`sale.order.amount_unpaid` is clamped to zero, so a sale order totalling a
negative amount is never offered and the *Settle the order* option cannot be
reached.

This module lists sale orders totalling a negative amount as well, so that a
cashier can settle them and pay the customer out through the POS. The order
leaves the list once it has been settled, like any other one.
