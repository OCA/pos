First you need to configure the Payment Method, to do so:

* Create an Account Journal and fill the needed fields:
   * Type: bank
   * Use in Point of Sale: True
   * Use a Payment Terminal: Adyen
   * Adyen Merchant Account
   * Adyen API key

Then, you need to make the created payment method available in the PoS and configure
the Adyen parameters

* Select the Journal in the Payment Methods available in the PoS Config

* Enter the Adyen Terminal Identifier

* Enable (or not) the Shopper Recognition features:
   * Enable Passive Shopper Recognition
   * Enable Active Shopper Recognition
   * Enable Adyen online payment with stored token
