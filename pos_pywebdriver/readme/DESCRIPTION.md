This module enables Odoo 19 Point of Sale to print receipts via a
[PyWebDriver](https://github.com/pywebdriver/pywebdriver) proxy, as an
alternative to the IoT Box.

PyWebDriver is an open-source Python service that exposes the same
`/hw_proxy/` HTTP endpoints as the Odoo IoT Box, allowing direct
ESC/POS printing without proprietary hardware.

Key features:

- Adds a **PyWebDriver** section to POS Settings, independent of the
  IoT Box configuration.
- Mutually exclusive with IoT Box: enabling PyWebDriver mode disables
  `pos_iot`, and vice versa.
- Remaps the `escpos` driver key returned by PyWebDriver's
  `status_json` to the `printer` key expected by Odoo 19, so the
  connection status indicator works correctly.
- Uses Odoo's built-in `HWPrinter` (no custom printer logic needed).
- Works on Odoo Community and Enterprise Editions 
  (the latter may install the incompatible `pos_iot` module).
