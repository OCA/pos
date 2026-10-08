This module inhibits the manipulation that the point of sale mades over the sales orders
pickings, and the creation of new pickings under the PoS picking type.

When settling a sale order in the PoS, the ordered quantities are loaded
even if the products were already delivered through the sale order pickings,
deducting only the quantities already invoiced. Without this module, the PoS
deducts the delivered quantities, which makes no sense here, as the PoS is
only used to charge the order, not to deliver it.
