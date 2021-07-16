* Go to 'Point of Sale' / 'Configuration' / 'Point of Sale'
* Select your Point of Sale
* Set the value in the field 'Picking Creation Delayed'. (Checked by default)

.. image:: /pos_picking_delayed/static/description/pos_config_form.png

* This module depends on ``queue_job`` module that requires specific
  configuration to works properly. Make sure your config file is correctly set.
  See https://github.com/OCA/queue/tree/12.0/queue_job

You should update your ``odoo.cfg`` file to add a new channel named
``root.pos_picking_delayed``:


.. code-block::

  [queue_job]
  channels = root:2,root.pos_picking_delayed:1

Otherwise, you'll have a non blocking warning in your log, like this one.

.. code-block::

  WARNING ? odoo.addons.queue_job.jobrunner.channels: unknown channel root.pos_picking_delayed, using root channel for job 23f6b872-1d2c-4003-bd38-a8486bbec664
