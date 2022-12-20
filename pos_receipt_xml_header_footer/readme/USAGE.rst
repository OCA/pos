To use XML (Odoo QWeb) and HTML in the headers and footers of your receipts, do
the following:

1. Open the Point of Sale application.
2. Go to Configuration → Point of Sale, and select your POS.
3. Enable 'Header & Footer'.
4. Prepend your header or footer with a single line containing ``<!DOCTYPE QWEB``.

For example, to use line breaks::

  <!DOCTYPE QWEB
  Hello<br />
  world!

Or to use QWeb templating magic::

  <!DOCTYPE QWEB
  <t t-esc='receipt.cashier'/> helped you today.
