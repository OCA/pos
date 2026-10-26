#. Go to *Point of Sale > Configuration > Payment Methods* and open a payment
   method with a bank journal.
#. Check **Use Transaction Fees**: the *Transaction Fees* tab appears.
#. Choose the **Fee Grouping Policy**, used for the fees posted at session
   closing:

   * *Grouped*: one expense journal item per expense account.
   * *Detailed*: one expense journal item per fee.

#. Add one or more fee rules:

   * **Fee Type** and **Amount**: percentage of the payment amount, or fixed
     amount per transaction in the **Fee Currency**.
   * **Apply On Refunds**: by default refunds generate no fee and original
     fees are never reversed. When checked, refunds generate the fee computed
     on the absolute refunded amount.
   * **Posting Policy**: *Immediate* (when the order is validated) or *At
     Session Close*.
   * **Fee Account** (expense), **Posting Journal** (bank or miscellaneous)
     and **Counterpart Account**.

Reconciliation with the bank settlement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Leave the **Counterpart Account** empty to use the outstanding account of the
payment method (or the company *Outstanding Receipts Account*), which is
the account debited by the standard session closing for bank payments.
The fee is credited there, so the balance left is the net amount the bank
settles. For example, a card sale of 100 with a fee of 2:

========================== ======= ========
Account                    Debit   Credit
========================== ======= ========
Outstanding (session)      100
Bank fees (fee entry)      2
Outstanding (fee entry)            2
========================== ======= ========

The bank statement line of 98 is reconciled against both outstanding journal
items. With the *Immediate* policy the fee reaches the outstanding account
before the session closing books the payment, so its balance is temporarily
negative. Another counterpart account must be reconcilable and must match the
settlement circuit of the bank; this cannot be checked by the module.
