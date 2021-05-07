This module makes odoo fetch printer status for the espos driver if enabled.


This allows retro-compatibility with the 12.0 printer status fetching method.


This module was created for pywebdriver (https://github.com/akretion/pywebdriver)

Printing with pywebdriver will still work without this but the printer status
will be wrongly assumed as "disconnected".
