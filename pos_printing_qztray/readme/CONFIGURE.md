To configure this module, you need to:

1.  Install and launch the \[QZ Tray\](<https://qz.io/>) desktop
    application on the machine where the thermal printer is connected.
2.  In Odoo, go to *Point of Sale* \> *Configuration* \> *Settings*.
3.  Select your POS configuration and enable **QZ Tray Printing**.
4.  Optionally select a **QZ Tray Printer** from the list — only
    printers with backend = qztray (managed by
    base_report_to_printer_qz) are shown. If left empty, QZ Tray will
    use the system default printer.
5.  Save the settings and open the POS session.

To extend or customise the receipt template, inherit PosEscposController
in your own module and override the relevant \_get\_\* methods (e.g.
\_get_header, \_get_order_lines). No frontend changes are required.
