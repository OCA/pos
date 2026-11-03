Foreign banknotes in the cash drawer are valued at the company rate of each
movement. The module does not revalue a currency that stays in the drawer.

A Point of Sale has one cash register. Foreign cash is counted on that
register, per currency. A second cash method cannot take a foreign tender.

The Point of Sale currency must be the company currency. A foreign list is
rejected otherwise.

A payment terminal cannot take a foreign tender. The terminal sends an amount
in the Point of Sale currency.

A price list in the foreign currency, used instead of the tender rate, is a
separate module. It overrides ``Order.getForeignDue``,
``Payment.computeAmountFromForeign`` and
``pos.payment._foreign_amount_matches_rate``.
