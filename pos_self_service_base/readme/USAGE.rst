This module should be used from a computer accessible to customers.
In order to limit the risk of unfortunate/malicious actions, you should:

* **Use a dedicated odoo account with the least possible rights**
* Configure the web browser to be in kiosk mode (cf. "Launch Firefox" section)

Those measures aren't sufficient *per se*, but should lower the risk significantly.

Launch Firefox
~~~~~~~~~~~~~~

This self-service module can be used in kiosk mode. To launch Firefox in kiosk mode, run this command::

    firefox <url> -foreground --kiosk
