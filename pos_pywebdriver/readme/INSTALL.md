## PyWebDriver

Install and start [PyWebDriver](https://github.com/pywebdriver/pywebdriver)
on the machine connected to the ESC/POS printer. Refer to the
[PyWebDriver documentation](https://github.com/pywebdriver/pywebdriver#readme)
for installation and configuration instructions.

## HTTPS requirement

In production (Odoo served over HTTPS), PyWebDriver must also run on HTTPS to
avoid mixed-content blocking by the browser.

The PyWebDriver Windows installer includes `generate_certificates.bat`, which:

1. Installs the local CA into the OS/browser trust store (`mkcert -install`)
2. Generates locally-trusted certificates for `localhost`, `127.0.0.1`, and `::1`

Run `generate_certificates.bat` once after installation. The generated
`localhost+2.pem` and `localhost+2-key.pem` are already referenced in
`config\config.ini`. Set `pywebdriver_ip` in POS settings to
`https://127.0.0.1:<port>`.

## pos_iot

This module is **incompatible** with `pos_iot`. If `pos_iot` is
installed, uninstall it before enabling PyWebDriver mode on any POS
configuration.
