from odoo import api, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    @api.model
    def get_customer_buy_product_ids(self, partner_id):
        if not partner_id:
            return []
        query = """
            SELECT DISTINCT pol.product_id
            FROM pos_order_line pol
            JOIN pos_order po ON pol.order_id = po.id
            WHERE po.partner_id = %s
        """
        self.env.cr.execute(query, (partner_id,))
        return [row[0] for row in self.env.cr.fetchall()]
