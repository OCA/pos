# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _create_order_picking(self):
        if self.lines:
            lines_to_replenish = self.lines.filtered(lambda l: l.product_id.route_ids)
            group_id = self.env["procurement.group"].create(
                {
                    "name": self.name,
                    "move_type": "one",
                    "pos_order_id": self.id,
                    "partner_id": self.partner_id.id,
                }
            )
            warehouse_id = self.env["stock.warehouse"].search(
                [("company_id", "=", self.company_id.id)], limit=1
            )
            for line in lines_to_replenish:
                if line.qty > line.product_id.qty_available:
                    self.env["procurement.group"].run(
                        [
                            self.env["procurement.group"].Procurement(
                                line.product_id,
                                line.qty,
                                line.product_uom_id,
                                warehouse_id.lot_stock_id,  # Location
                                line.name,  # Name
                                self.name,  # Origin
                                self.company_id,
                                {
                                    "warehouse_id": warehouse_id,
                                    "route_ids": self.env["stock.location.route"],
                                    "date_planned": fields.Datetime.now(),
                                    "group_id": group_id,
                                },  # Values
                            )
                        ]
                    )
            mrp_productions = (
                self.env["mrp.production"]
                .search([("origin", "=", self.name)])
                .filtered(lambda production: production.state == "confirmed")
            )
            for mrp_production in mrp_productions:
                mrp_production.write({"qty_producing": mrp_production.product_qty})
                mrp_production._compute_state()
                mrp_production._set_qty_producing()
                mrp_production.move_raw_ids._compute_should_consume_qty()
                mrp_production.button_mark_done()
        super()._create_order_picking()
