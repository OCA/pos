# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    limited_lots_loading = fields.Boolean()
    limited_lots_amount = fields.Integer(default=20000)
    lot_load_background = fields.Boolean()

    def get_limited_lots_loading(self, product_ids, lot_fields):
        if not product_ids:
            return []
        query = """
            WITH lm AS (
                  SELECT lot_id,
                         Max(write_date) date
                    FROM stock_quant
                    WHERE lot_id IS NOT NULL
                GROUP BY lot_id
            )
               SELECT l.id
                 FROM stock_production_lot l
            LEFT JOIN product_product p ON l.product_id=p.id
            LEFT JOIN product_template t ON p.product_tmpl_id=t.id
            LEFT JOIN lm ON l.id=lm.lot_id
                WHERE l.available_in_pos
                    AND (l.company_id=%(company_id)s OR l.company_id IS NULL)
                    AND p.id IN %(product_ids)s
                    AND t.available_in_pos
                    AND t.sale_ok
                    AND (
                        %(available_categ_ids)s IS NULL
                        OR t.pos_categ_id=ANY(%(available_categ_ids)s)
                    )
             ORDER BY t.priority DESC,
                      COALESCE(lm.date,l.write_date,p.write_date) DESC
                LIMIT %(limit)s
        """
        params = {
            "company_id": self.company_id.id,
            "available_categ_ids": self.iface_available_categ_ids.mapped("id")
            if self.iface_available_categ_ids
            else None,
            "product_ids": tuple(int(p_id) for p_id in product_ids),
            "limit": self.limited_lots_amount,
        }
        self.env.cr.execute(query, params)
        lot_ids = self.env.cr.fetchall()
        lots = self.env["stock.production.lot"].search_read(
            [("id", "in", lot_ids)], fields=lot_fields
        )
        return lots
