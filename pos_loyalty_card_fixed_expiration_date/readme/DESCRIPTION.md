In Odoo 18 the PoS always sets the expiration date of the gift cards it
generates to today plus one year, so the fixed duration provided by
*Loyalty Card Fixed Expiration Date* (`loyalty_card_fixed_expiration_date`)
has no effect on gift cards sold in the PoS, because they already come with
an expiration date.

This module makes the PoS use the **Duration Days** of the gift card
program instead.
