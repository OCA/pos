This module extends the functionality of odoo Point Of Sale to reduce creation
time of the PoS orders, via the front UI.

For that purpose, it delays the creation of the picking associated, that will
be created later by queue job.

This module is interesting specially in a context of Synchroneous Point Of
Sale that is introduced by certification modules like 'l10n_fr_pos_cert' because
in such cases, the bill will be printed only when the pos order is created (
after the call of the function create_from_ui) and the creation of the picking
is the process that takes the most time.

See https://github.com/odoo/odoo/pull/26314#issuecomment-422949266
for more information.
