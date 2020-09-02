This module extends the functionality of Point of Sale module.

By default, in Odoo a timeout is set to 30 seconds for the creation of
a PoS order. This threshold is usually sufficient, but in some cases it is not,
mainly if the connection is bad, or if some custom modules add extra
long treatments.

This module allows to change this default value.

If the call contains more than one order (after a long disconnection period
for example, or if the previous call raised the timeout) the effective timeout
value applied will be equal to the defined timeout value multiplied by the
number of orders.
