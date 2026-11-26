## Processing a Refund

```
Customer returns item → Employee processes refund in POS
→ Select credit payment method for refund
→ System calls /pos_payment_credit/refund endpoint
→ Credit amount added to customer profile
→ Success message shows new balance
```

## Making a Payment with Credit

```
Customer selects products → Total is $120
→ Customer credit balance: $150
→ Employee selects credit payment method
→ System validates sufficient balance
→ Confirmation dialog displays before/after balance
→ System calls /pos_payment_credit/payment endpoint  
→ Credit deducted from customer profile
→ Order completed successfully
```
