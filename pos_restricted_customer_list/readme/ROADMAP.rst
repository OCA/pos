I see two obvious extensions to the functionality already developed:
1. Add back on demand customer lookup (only when online);
2. Make customers available to pos, dependent on the pos session or user.
In pos.config or res.users (or both) there could be a selection field customer_loading with values:

 - 'no_one': disable customer loading (usefull for self service pos, without customer feature)
 - 'selection': the feature now implemented (load only checked customers) (default value)
 - 'all': for super cashier, (after sale PoS), etc.
