The main purpose of this module is to avoid configuration errors related to fiscal positions and taxes by the final user.
The PoS fiscal position button can be hidden to delegate this task to the PoS settings.

1. This module hide **"Default Sales Tax"** field (*Settings > PoS > Accounting*). It will be managed by **"Default Taxes"** (*Settings > Invoicing > Taxes*).
2. It adds a new field **"Hide fiscal position button"** (*Settings > PoS -> PoS Interface*) in order to hide the button "Fiscal Position" in PoS interface if there are "Flexible Taxes" configured.
3. It also set a "Fiscal Position" by default on every pos order if it's configured in the PoS and the client's order has a different one from "Flexible Taxes" in PoS config.
