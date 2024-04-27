# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class IrAttachment(models.Model):
    _name = "ir.attachment"
    _inherit = ["ir.attachment"]

    @api.model_create_multi
    def create(self, vals_list):
        res = super().create(vals_list)
        for attachment in res:
            if attachment.res_model == "pos.order":
                pos_order = self.env["pos.order"].search(
                    [("id", "=", attachment.res_id)]
                )
                if pos_order.splitting_move_id:
                    linked_account_move = pos_order.splitting_move_id
                    res.copy(
                        {"res_model": "account.move", "res_id": linked_account_move.id}
                    )
        return res

    def unlink(self):
        for attachment in self:
            if attachment.res_model == "pos.order":
                pos_order = self.env["pos.order"].search(
                    [("id", "=", attachment.res_id)]
                )
                linked_account_move = pos_order.splitting_move_id
                link_attachment = self.env["ir.attachment"].search(
                    [
                        ("res_id", "=", linked_account_move.id),
                        ("res_model", "=", "account.move"),
                        ("checksum", "=", attachment.checksum),
                    ]
                )
                link_attachment.unlink()
            res = super().unlink()
            return res
