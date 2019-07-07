* Go to 'Point of Sale' / 'Configuration' / 'Point of Sale'
* Select your Point of Sale
* Set the value in the field 'Picking Creation Delayed'. (Checked by default)

.. image:: /pos_picking_delayed/static/description/pos_config_form.png

* This module depends on ``queue_job`` module that requires specific
  configuration to works properly. Make sure your config file is correctly set.
  See https://github.com/OCA/queue/tree/12.0/queue_job
