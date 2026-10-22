**Open a session**

1. Open the **Point of Sale** app.
2. Open a Point of Sale that has foreign currencies.
3. On **Opening Cash Control**, type the counted cash in the Point of Sale
   currency.
4. For each **Opening** foreign-currency field, type the counted amount.
   The proposed value is the counted closing of the previous session.
5. Click **Open session**.
6. The difference, if any, is posted on the cash journal in that currency.

**Take a payment in a foreign currency**

1. On the payment screen, click a cash or bank payment method.
2. On the keypad, type the amount the customer hands over in the foreign
   currency (for example ``500`` for 500 euro).
3. Click **Currency**.
4. Click the currency. The rate is shown as
   ``1 <POS currency> = <rate> <foreign currency>``
   (for example ``1 USD = 0.227273 F``).
5. Check **Amount received**: it is the number from step 2, in that
   currency. **Point of Sale amount** is that number converted at the rate.
   **Due** is the amount still due in that currency.
6. If you skipped step 2, **Amount received** starts as the amount still
   due in that currency. Change it in the field when needed.
7. Click **Apply**.
8. Click **Validate**.

On a Point of Sale with no cash method, the keypad rejects an amount above
the amount due. Skip step 2, open **Currency**, and type the foreign amount
in **Amount received**.

**Change or clear a foreign tender**

1. Select the payment line.
2. To add foreign units, click **+10**, **+20** or **+50**. A number key
   does not change an amount already applied.
3. To set another amount: click **Currency**, change **Amount received**,
   then click **Apply**.
4. To drop the foreign currency and keep the Point of Sale amount: click
   **Currency**, then **Use POS currency**.
5. To leave the line unchanged: click **Currency**, then **Cancel**.

When **Amount received** equals the amount still due in that currency, the
order settles with no change. A larger amount, including one cent more, is
an overpayment: change is given in the Point of Sale currency on the cash
register.

**Currency** is hidden when the Point of Sale has no foreign currencies. It
stays disabled for customer-account lines, a second cash method, a payment
terminal, and the change line.

**Put foreign cash in or take it out**

1. In the session menu, click **Cash In/Out**.
2. Click **Cash In** or **Cash Out**.
3. Choose the currency in the list.
4. Type the amount.
5. Type the **Reason**.
6. Click **Confirm**. There is no limit on the amount taken out.

**Refund in a foreign currency**

1. Pay the refund with a foreign cash tender as above.
2. If the payout is larger than that currency's drawer (including orders
   not yet sent to the server), a warning appears.
3. Click **Ok** to continue, or **Cancel** to return to the payment
   screen. The server does not block the refund. The refund uses the rate
   of the refund day.

**Close a session**

1. In the session menu, click **Close Session**.
2. For each foreign cash row, type the counted amount (fields start at
   zero).
3. For each foreign bank method and currency row, type the counted amount
   (fields start at the expected amount).
4. Click **Close Session**.
5. A difference is posted in that currency. Bank differences use
   **Currency Difference Journal** when it is set, otherwise the method's
   journal.

**Check an order**

1. Open the **Point of Sale** app.
2. Click **Orders**, then **Orders**.
3. Open the order.
4. Open the **Payments** tab.
5. Read **Tender Currency**, **Amount in Currency** and **Tender Rate**.

**Check a closed session**

1. Open the **Point of Sale** app.
2. Click **Orders**, then **Sessions**.
3. Open the closed session.
4. Click **Journal Items**.
5. The list includes the session entry, the cash and bank payments, the
   exchange difference and the foreign bank difference entry.

**Sales Details**

1. Open the **Point of Sale** app.
2. Click **Reporting**, then **Sales Details**.
3. Run the report.
4. Point of Sale currency totals exclude foreign tenders.
5. Under **Foreign currencies**, read per currency the tendered amount,
   the Point of Sale amount, the rate, and the counted cash and bank
   amounts.
