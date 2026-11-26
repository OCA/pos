Restricts Point of Sale users and managers to specific POS configurations:

- Adds *Allowed Points of Sale* on `res.users` (empty means unrestricted access).
- Enforces record rules across POS configs, sessions, orders, order lines, payments,
  and POS order analysis reports.
- Optional *Hide POS Configuration Menus* toggle to hide POS configuration menus for
  non-admin restricted users.
