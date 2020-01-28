This module extends the functionality of point of sale to allow users to input
the ending balances of the payment methods when they close a POS Session.
The system will then post the difference to the 'Liquidity Transfers' account.

Currently it's only possible to define the ending balance for the cash
if you configure "Cash Control" in the POS Configuration. But that setting
will not allow users to enter the ending balances for credit card transactions
, for example.
