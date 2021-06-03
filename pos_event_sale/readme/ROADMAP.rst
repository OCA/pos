
* Add more test tours, specially ones that check availabilities.

* Handle event registration details. It could be another popup right
  before going to payment (similar to core `event_sale` workflow).

* Cancel registrations when the PoS order are refunded, possibly in a separate
  module depending on `pos_order_return` to get the reference of the `refunded_order_id`.

* Possibly add an option to print the event badges from the Point of Sale.
