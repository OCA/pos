This module is needed in order to be able to access the POSbox over SSL instead of plain HTTP.
Without it, you will have to run the Odoo POS in HTTP mode as well, because otherwise,
communication with the POSbox will fail because of a Mixed mode error (HTTPS and HTTP being used
simultaneously on one page).
