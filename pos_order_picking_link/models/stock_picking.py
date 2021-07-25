# © 2016 KMEE INFORMATICA LTDA (https://kmee.com.br)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class StockPicking(models.Model):
    _inherit = "stock.picking"

    pos_order_ids = fields.One2many(
        comodel_name="pos.order",
        inverse_name="picking_id",
        copy=False,
        string="POS order", readonly=True
    )

    def action_view_pos_orders(self):
        """This function returns an action that display existing pos orders
        of given stock pickings.
        It can either be a in a list or in a form view, if there is only
        one order to show.
        """
        self.ensure_one()
        result = self.env.ref("point_of_sale.action_pos_pos_form").read()[0]
        if len(self.pos_order_ids) > 1:
            result["domain"] = "[('id', 'in', {})]".format(self.pos_order_ids.ids)
        else:
            form_view = self.env.ref("point_of_sale.view_pos_pos_form")
            result["views"] = [(form_view.id, "form")]
            result["res_id"] = self.pos_order_ids.id
        return result
