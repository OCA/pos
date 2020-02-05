* When a partially returned order is selected, every line is loaded to be
  returned, even the fully returned ones (with 0 quantity). These lines should
  be skipped, since this module will forbid any return quantity for them.
* When an order is fully returned, during the same session can be still
  selected from order list within because of caching issues. Anyway, the order
  cannot be returned again.
