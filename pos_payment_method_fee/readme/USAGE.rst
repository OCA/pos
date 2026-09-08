#. Sell in the POS with a payment method using transaction fees. Fees are
   computed when the order is validated; draft orders do not generate fees.
#. Fees with the *Immediate* policy are posted right away; the others when
   the session is closed, whatever the way it is closed.
#. Follow the fees in *Point of Sale > Orders > Payment Fees* or from the
   *Fees* button of the session.
#. If a fee cannot be posted (e.g. deprecated account or locked period) it is
   left in *Error* with the reason and its accounting date is kept. Fix the
   cause and click **Retry** (POS or accounting managers), or close the
   session, which retries the fees in error.
#. Disabling the fees of a payment method, or changing its rules, only
   affects new payments.
