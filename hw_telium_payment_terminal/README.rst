================================
Hardware Telium Payment Terminal
================================

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta
.. |badge2| image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3
.. |badge3| image:: https://img.shields.io/badge/github-OCA%2Fpos-lightgray.png?logo=github
    :target: https://github.com/OCA/pos/tree/12.0/hw_telium_payment_terminal
    :alt: OCA/pos
.. |badge4| image:: https://img.shields.io/badge/weblate-Translate%20me-F47D42.png
    :target: https://translation.odoo-community.org/projects/pos-12-0/pos-12-0-hw_telium_payment_terminal
    :alt: Translate me on Weblate

|badge1| |badge2| |badge3| |badge4|

This module adds support for credit card reader and checks printers
using Telium protocol in the Point of Sale. This module is designed to
be installed on the *POSbox* (i.e. the proxy on which the USB devices
are connected) and not on the main Odoo server. On the main Odoo server,
you should install the module *pos_payment_terminal*.

This module has been developped during a POS code sprint at Akretion
France from July 7th to July 10th 2014.

**Table of contents**

.. contents::
   :local:

Installation
============
Add this module in the PosBox in this folder :
/home/pi/odoo/addons
Reboot the PosBox

Configuration
=============

The configuration of the hardware is done in the configuration file of
the Odoo server of the POSbox. You can add the following entries in
the configuration file (optional).

* payment_terminal_device_name (default = /dev/ttyACM0)
* payment_terminal_device_rate (default = 9600)

The Telium protocol is used by Ingenico and Sagem payment terminals. It
is based on the Concert protocol, so it can probably work with payment
terminals from other brands. This module implements the protocol E+ (and
not the protocol E), so it requires a Telium Manager version 37783600
or superior.
Information : https://lists.launchpad.net/openerp-community/pdfcezlBjgtdJ.pdf
To get the version of the Telium Manager on an Ingenico
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
* Ingenico Desk/5000 (USB Mode)

This module requires the Python library *pycountry* version >= 16.11.08,
if you use a currency different of EUR.
To install it, run:

``sudo pip install pycountry``

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed
`feedback <https://github.com/OCA/pos/issues/new?body=module:%20hw_telium_payment_terminal%0Aversion:%2012.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Do not contact contributors directly about support or help with technical issues.

Credits
=======

Authors
~~~~~~~

* Akretion

Contributors
~~~~~~~~~~~~

* Florent de Labarre

Maintainers
~~~~~~~~~~~

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

This module is part of the `OCA/pos <https://github.com/OCA/pos/tree/12.0/hw_telium_payment_terminal>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
