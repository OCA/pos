Different treatments exist between 'pos.payment' and 'account.bank.statement.line', 
so this report will only display transactions from cash-type journals. However, there are the following limitations:

Cash In/Out transactions do not generate a 'pos.payment', only an 'account.bank.statement.line'.
For cash-type journals, 'pos.payment' entries create a single consolidated 'account.bank.statement.line' when the session is closed, 
but other payment methods are not included.