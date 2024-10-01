This module allow you to load a pricelist for a customer in the background.

**Context**
In the POS, we can configure a list of available pricelists. These price lists are loaded during start-up and only these can be chosen for any order.
When a customer is selected, the POS will try to find the customer's pricelist (property_pricelist_id) among the available pricelists. 
If it's found, the pricelist is selected otherwise a default one will be selected instead.

**With this module**
When a customer is selected, his pricelist (property_pricelist_id) is loaded and available to be chosen.
