When the cashier prints a receipt the point of sale logo will show up in
the receipt, embedded as a data URI so preview/print does not depend on
``web.base.url``. After changing the logo, close and reopen the POS so
the client reloads ``pos.config``.
