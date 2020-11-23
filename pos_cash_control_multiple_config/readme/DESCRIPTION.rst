This module extends the functionality of the point of sale fixing
cash control in a multi pos config context.

By default, in Odoo, if we have two Point of Sale (``pos.config``) with cash control
enabled on each Point of sale, the opening balance will be bad, when opening many
session.

This module fixes that bug.

Ref :

https://github.com/odoo/odoo/issues/62147
