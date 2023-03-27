This module extends the Odoo Point of Sale to prevent to merge lines if product
is configured.

By default, new line can be merged with a previous one if the informations are the same.
(same product, same restaurant note, etc...) and if the UoM Category allow it.

The new module add a boolean field 'Mergeable Line' (default True).

If unchecked, the product will never be merged into another line.

That's important in some context, as in the management of returnable products,
where we want to have a record of all movements.
