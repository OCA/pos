Collect POS customer zip code to determine the catchment area.

This module add zip code field on POS order. POS sessions that require
catchment area will add an extra check before validate the payment
to ensure a zip code has been collected. If cashier choose a partner
or update its zip code this will set the pos order zip code.
