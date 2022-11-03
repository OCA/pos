# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosSession(models.Model):

    _inherit = "pos.session"

    pos_session_product_control_ids = fields.One2many(
        "pos.session.product.control",
        "session_id",
        string="pos_session_product_control",
    )

    @api.model
    def create(self, values):
        res = super(PosSession, self).create(values)
        for product_id in res.config_id.product_ids:
            vals = {
                "product_id": product_id.id,
                "session_id": res.id,
                "product_inventory_start_value": product_id.qty_available,
            }
            res["pos_session_product_control_ids"].create(vals)
        return res

    def update_product_opening_value(self, opening_values):
        for key, value in opening_values.items():
            record = self.env["pos.session.product.control"].search(
                [
                    ("session_id", "=", self.id),
                    ("product_id", "=", int(key)),
                ]
            )
            if record:
                record.product_real_start_value = int(value)

    def update_product_closing_value(self, opening_values):
        for key, value in opening_values.items():
            product_id = self.env["product.product"].search(
                [
                    ("id", "=", int(key)),
                ]
            )
            record = self.env["pos.session.product.control"].search(
                [
                    ("session_id", "=", self.id),
                    ("product_id", "=", product_id.id),
                ]
            )
            if record:
                record.product_real_end_value = int(value)
                record.product_inventory_end_value = product_id.qty_available
