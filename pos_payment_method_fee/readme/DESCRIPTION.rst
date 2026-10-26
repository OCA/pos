This module records the financial cost of POS bank payment methods (acquirer,
gateway or platform fees) without changing the order, its taxes or the amount
paid by the customer: fees are an internal financial cost.

* Several percentage and fixed fee rules per payment method, cumulative.
* Only payment methods with a bank journal can use transaction fees.
* Fees are computed once per payment and rule when the order is validated,
  and stored in a fee ledger (*Payment Fees*) with a snapshot of the
  conditions used, so later configuration changes never alter them.
* Posting at order validation (*Immediate*) or at session closing, in
  dedicated journal entries linked to the session and the payments.
* Grouped or detailed journal items, always one journal entry per session,
  company, journal and accounting date.
* Multi-currency: fees are converted at the payment date, like the standard
  session closing.
* A posting failure never blocks a sale nor the session closing: the fee is
  left in error and can be posted again.
