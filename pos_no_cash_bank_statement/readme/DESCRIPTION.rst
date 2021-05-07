Up to Odoo 12.0, POS sessions generated bank statements for each payment method and therefore closing a POS session would generate payment journal entries for all payment methods.

In Odoo 13.0 and upper, only the cash payment method generate a cash register/bank statement and therefore the payment journal entries. The non-cash payment methods don't generate any payment journal entries.

With this module, you have a new option **Generate Bank Statement** on non-cash POS payment method. If you enable that option, Odoo will generate a bank statement and will generate the payment journal entries upon POS session closing. For example, if your POS accepts payment by check, you certainly want to enable that option for the *Check* POS payment method.
