# Copyright 2019 Coop IT Easy SCRLfs
# 	    Robin Keunen <robin@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields, api


class Container(models.Model):
    _name = 'pos.container'
    _description = 'Container for bulk items'

    name = fields.Char(
        string='Name',
    )
    barcode = fields.Char(
        'Barcode',
        size=13,
    )
    weight = fields.Float(
        string='Weight (kg)',
    )
    owner_id = fields.Many2one(
        comodel_name='res.partner',
        inverse_name='container_ids',
        string='Owner',
    )

    _sql_constraints = [
        ('barcode_uniq',
         'unique(barcode)',
         "A barcode can only be assigned to one container !"),
    ]

    @api.model
    def create_from_ui(self, containers):
        # retourne la liste des ids dans le même ordre que la liste fournie
        container_ids = []
        for container in containers:
            container_id = container.pop('id', False)
            if container_id:  # Modifying existing container
                self.browse(container_id).write(container)
            else:
                container_id = self.create(container).id
            container_ids.append(container_id)
        return container_ids
