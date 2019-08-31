Hardware Telium Payment Terminal
================================

This module adds support for credit card reader and checks printers
using Telium protocol in the Point of Sale. This module is designed to
be installed on the *POSbox* (i.e. the proxy on which the USB devices
are connected) and not on the main Odoo server. On the main Odoo server,
you should install the module *pos_payment_terminal*.

The configuration of the hardware is done in the configuration file of
the Odoo server of the POSbox. You should add the following entries in
the configuration file:

* payment_terminal_device_name (default = /dev/ttyACM0)
* payment_terminal_device_rate (default = 9600)

The Telium protocol is used by Ingenico and Sagem payment terminals. It
is based on the Concert protocol, so it can probably work with payment
terminals from other brands. This module implements the protocol E+ (and
not the protocol E), so it requires a Telium Manager version 37783600
or superior. To get the version of the Telium Manager on an Ingenico
terminal press F > 0-TELIUM MANAGER > 2-Consultation > 4-Configuration
> 2-Software > 1-TERMINAL > On Display > Telium Manager and then read
the field *M20S*.

You will need to configure your payment terminal to accept commands
from the POS. On an Ingenico terminal press F > 0-TELIUM MANAGER >
5-Initialization > 1-Parameters > Cash Connection and then select *On*
and then *USB*. After that, you should reboot the terminal.

This module has been successfully tested with:

* Ingenico EFTSmart4S
* Ingenico EFTSmart2 2640 with Telim Manager version 37784503
* Ingenico iCT220
* Ingenico iCT250
* Ingenico i2200 cheque reader and writer

This module requires the Python library *pycountry* version >= 16.11.08.
To install it, run:

``sudo pip install pycountry``

This module has been developped during a POS code sprint at Akretion
France from July 7th to July 10th 2014. This module is part of the POS
project of the Odoo Community Association http://odoo-community.org/.
You are invited to become a member and/or get involved in the
Association !
