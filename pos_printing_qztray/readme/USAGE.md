To use this module, you need to:

1.  Open a POS session that has **QZ Tray Printing** enabled.
2.  Make sure the QZ Tray desktop application is running on the POS
    machine.
3.  Process a sale and click **Payment** to print the receipt.

The receipt is sent directly to the thermal printer via QZ Tray. Receipt
HTML is rendered to PNG and converted to ESC/POS format server-side before
sending following native Odoo logic. The cash drawer is opened automatically after each print if enabled.

No IoT Box or network printer configuration is required.
