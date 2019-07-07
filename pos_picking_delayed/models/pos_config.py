# Copyright 2018 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    picking_creation_delayed = fields.Boolean(
        string='Picking Creation Delayed', default=True,
        help="Check this box if you want to delay the creation of the picking"
        " created by the PoS orders. If checked, the pickings will"
        " be created later, by a cron task.")
