This module is needed in order to be able to access the POSbox over SSL instead of plain HTTP.
Without it, you will have to run the Odoo POS in HTTP mode as well, because otherwise,
communication with the POSbox will fail because of a Mixed mode error (HTTPS and HTTP being used
simultaneously on one page).

After installing and configuring, just use the Point of Sale via HTTPS instead of HTTP, and
notice that the POSbox connection still works.
