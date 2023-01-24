16.0.1.0.0
~~~~~~~~~~

* Migrate to V16.0
* Remove ``pos.order`` and ``pos.order.line`` funcionality from V14.0.
  It's already done by V16.0.
* Remove tests.
* Create a ``res.config.settings`` field `pos_iface_display_margin`
  to display margins in PoS frontend.

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
