Before using this module, you need to define pricelists with "Advanced price rules" in point of sale settings (Pricing section).

After that, you need to create a Pricelist with a Splitting partner configured and a rule with type **Split Invoice**.
On that rule you need to set the base pricelist used to compute the total price, the pricelist used to split and the amount payed by the splitting partner.

For example, if we have a Product with a Pricelist A of 100 and a Pricelist B of 80, and we specify the price computation "Based on" Pricelist A and "Split amount based on" Pricelist B with "Split percentage" of 90%, the final amount payed by the Customer will be: 100 - 80*90% = 28.

All the pricelists involved in the calculations (including the "Based on") must be included on the Point Of Sale Configuration in order to proceed properly.
