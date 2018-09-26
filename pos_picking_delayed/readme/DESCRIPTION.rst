This module extends the functionality of odoo Point Of Sale to reduce creation
time of the PoS orders, via the front UI.

For that purpose, it delays the creation of the picking associated, that will
be created later, by cron. (set by default to run each minute).

Technical information
---------------------

A log will be generated to mention the creation of the pickings by cron.

``2018-09-28 07:47:18,300 163 INFO db odoo.addons.base.ir.ir_cron: Starting job `Create Delayed PoS Picking.``

``2018-09-28 07:47:19,168 163 INFO db odoo.addons.pos_picking_delayed.models.pos_order: Pickings created for 3 PoS Orders``

This module is interesting specially in a context of Synchroneous Point Of
Sale that is introduced by certification modules like 'l10n_fr_pos_cert' because
in such cases, the bill will be printed only when the pos order is created (
after the call of the function create_from_ui) and the creation of the picking
is the process that takes the most time.

See https://github.com/odoo/odoo/pull/26314#issuecomment-422949266
for more information.
