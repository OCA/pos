from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    def _default_pricelist(self):
        return self.env["product.pricelist"].search(
            [
                ("company_id", "in", (False, self.env.company.id)),
                ("currency_id", "=", self.env.company.currency_id.id),
            ],
            limit=1,
        )

    hide_pricelist_button = fields.Boolean(
        default=False,
    )
    selectable_pricelist_ids = fields.Many2many(
        "product.pricelist",
        string="Selectable Pricelists",
        domain="[('id', 'in', available_pricelist_ids)]",
        relation="pos_conf_selectable_pricelist_rel",
        default=_default_pricelist,
    )
    pricelist_id_domain = fields.Binary(
        compute="_compute_pricelist_id_domain",
        readonly=True,
        store=False,
    )

    @api.depends(
        "hide_pricelist_button", "allowed_pricelist_ids", "selectable_pricelist_ids"
    )
    def _compute_pricelist_id_domain(self):
        for rec in self:
            if rec.hide_pricelist_button:
                rec.pricelist_id_domain = [("id", "in", rec.allowed_pricelist_ids.ids)]
            else:
                rec.pricelist_id_domain = [
                    ("id", "in", rec.selectable_pricelist_ids.ids)
                ]

    @api.onchange("selectable_pricelist_ids")
    def onchange_selectable_pricelist_ids(self):
        if self.pricelist_id.id not in self.selectable_pricelist_ids.ids:
            self.update({"pricelist_id": self.selectable_pricelist_ids[0].id})

    @api.onchange("available_pricelist_ids")
    def onchange_available_pricelist_ids(self):
        self.update(
            {"selectable_pricelist_ids": [(6, 0, self.allowed_pricelist_ids.ids)]}
        )

    @api.onchange("hide_pricelist_button")
    def onchange_hide_pricelist_button(self):
        self.update(
            {"selectable_pricelist_ids": [(6, 0, self.allowed_pricelist_ids.ids)]}
        )

    def write(self, vals):
        for rec in self:
            if vals.get("available_pricelist_ids"):
                if rec and not vals.get("selectable_pricelist_ids"):
                    selectable = set(rec.selectable_pricelist_ids.ids)
                else:
                    selectable = set(vals["selectable_pricelist_ids"][0][2])
                # leave only ids from available_pricelist_ids
                intersection = list(
                    selectable.intersection(set(vals["available_pricelist_ids"][0][2]))
                )
                if intersection:
                    vals["selectable_pricelist_ids"] = [(6, 0, intersection)]
                else:
                    vals["selectable_pricelist_ids"] = vals["available_pricelist_ids"]
        return super(PosConfig, self).write(vals)
