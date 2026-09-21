To configure payment methods and their fees in Point of Sale:

1. Go to *Point of Sale -> Configuration -> Payment Methods*.
2. Create a new payment method or open an existing one.
3. Configure the **Fee Grouping Policy**:

   * **Grouped**: Fees are summarized per fee rule into a single journal entry at session close.
   * **Detailed**: One journal entry is generated per transaction fee at session close.

4. Under the **Transaction Fees** section, add one or more fee rules:

   * **Fee Type**: Select *Fixed* or *Percentage*.
   * **Amount**: Set the fixed amount or percentage value.
   * **Posting Policy**: Select *Immediate* (posted immediately upon payment) or *At Session Close* (posted when POS session is closed).
   * Configure the **Fee Account**, **Counterpart Account**, and **Posting Journal**.

5. Save the payment method.
6. Ensure the payment method is added to the relevant **POS Configuration** (*Point of Sale -> Configuration -> Point of Sale*).
