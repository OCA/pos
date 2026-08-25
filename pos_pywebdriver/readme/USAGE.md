Once configured, open the POS session. The proxy connection is
established automatically on startup.

## Status Indicator

The network status indicator in the POS navbar shows the proxy
connection state:

- **Green sitemap icon** — connected to PyWebDriver, printer ready.
- **Spinning icon** — connecting.
- **Red sitemap icon** — disconnected; check that PyWebDriver is running
  and the IP address is correct.

## Printing

Use the **Print Receipt** button as normal. Receipts are rendered as
JPEG images and sent to PyWebDriver via `/hw_proxy/default_printer_action`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Status indicator stays disconnected | PyWebDriver not running, or wrong IP/port in settings |
| "Printing failed — unknown error" | PyWebDriver reachable but printer not responding; check ESC/POS connection |
| Browser print dialog opens instead | `use_pywebdriver` not saved, or session cache stale — reload the POS page |
