This module depends on ``sale_margin`` module to reuse algorithm present in the
function ``_get_purchase_price`` of the model ``sale.order.line`` to
compute correctly purchase price, in a multicurrency context.

This dependency can be removed, when Odoo Core will be correctly refactored,
moving this ``@api.model`` function in a more generic module (``account``
for exemple).
