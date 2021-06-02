14.0.1.0.0
~~~~~~~~~~

* Migrate to V14.0

13.0.1.0.0
~~~~~~~~~~

* Migrate to V13.0
* Reuse ``sale_margin`` computation to handle multi currency context.
* Correct computation of margin, if a module that adds ``uom_id`` on
  ``pos.order.line`` is installed.
* Add test
