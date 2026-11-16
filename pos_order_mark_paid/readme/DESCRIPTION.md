This module allows to mark a POS order as fully paid while writing off the
difference to a pre-defined account.

A new "Mark as Paid" button is displayed on the POS payment screen.
You configure the write-off thresholds per Point of Sale: a percentage of the order
total and an amount. An order can be marked as paid only if the write-off amount
does not exceed any of these thresholds.

The write-off is shown on the receipt, on the POS order, in the session report, and
as a separate line on the invoice of an invoiced order. When the session is closed,
the write-offs of the orders that are not invoiced are booked on the write-off account.
