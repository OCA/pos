This module provides a pure-software alternative to the Odoo IoT Box for
thermal receipt printing in the Point of Sale, using \[QZ
Tray\](<https://qz.io/>) as the print driver.

It extends base_report_to_printer_qz — which adds QZ Tray backend
support to printing.printer — and brings that functionality into the
POS, allowing users to select a printer with backend = qztray directly
from the POS configuration.

Key features:

- **Cash drawer support**: the cash drawer open command (ESC p) is sent
  automatically after each receipt print.
- **No IoT Box required**: designed as a software-only alternative for
  setups where deploying IoT infrastructure is not desirable.
