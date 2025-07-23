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
        string="Hide Pricelists Button",
        help=(
            "If enabled, the pricelist selection button "
            "will be hidden in the PoS interface."
        ),
    )
    selectable_pricelist_ids = fields.Many2many(
        "product.pricelist",
        string="Selectable Pricelists",
        domain="[('id', 'in', available_pricelist_ids)]",
        relation="pos_conf_selectable_pricelist_rel",
        default=_default_pricelist,
    )

    @api.model
    def _get_pos_ui_pos_config_fields(self):
        return super()._get_pos_ui_pos_config_fields() + [
            "hide_pricelist_button",
            "selectable_pricelist_ids",
        ]

    @api.onchange("selectable_pricelist_ids")
    def onchange_selectable_pricelist_ids(self):
        if (
            self.selectable_pricelist_ids
            and self.pricelist_id.id not in self.selectable_pricelist_ids.ids
        ):
            self.update({"pricelist_id": self.selectable_pricelist_ids[0].id})

    @api.onchange("available_pricelist_ids")
    def onchange_available_pricelist_ids(self):
        if self.available_pricelist_ids and not self.selectable_pricelist_ids:
            self.selectable_pricelist_ids = [(6, 0, self.available_pricelist_ids.ids)]

    @api.onchange("hide_pricelist_button")
    def onchange_hide_pricelist_button(self):
        if self.hide_pricelist_button:
            self.selectable_pricelist_ids = [(5, 0, 0)]
        elif not self.selectable_pricelist_ids:
            self.selectable_pricelist_ids = [(6, 0, self.available_pricelist_ids.ids)]

    def write(self, vals):
        for rec in self:
            if "available_pricelist_ids" in vals:
                if (
                    "selectable_pricelist_ids" in vals
                    and vals["selectable_pricelist_ids"]
                    and vals["selectable_pricelist_ids"][0][0] == 6
                ):
                    selectable_ids_current_or_new = set(
                        vals["selectable_pricelist_ids"][0][2]
                    )
                else:
                    selectable_ids_current_or_new = set(
                        rec.selectable_pricelist_ids.ids
                    )

                available_ids_from_vals = set()
                if (
                    "available_pricelist_ids" in vals
                    and vals["available_pricelist_ids"]
                    and vals["available_pricelist_ids"][0]
                    and vals["available_pricelist_ids"][0][0] == 6
                ):
                    available_ids_from_vals = set(vals["available_pricelist_ids"][0][2])

                intersection = list(
                    selectable_ids_current_or_new.intersection(available_ids_from_vals)
                )

                if intersection:
                    vals["selectable_pricelist_ids"] = [(6, 0, intersection)]
                else:
                    if "selectable_pricelist_ids" not in vals:
                        vals["selectable_pricelist_ids"] = vals[
                            "available_pricelist_ids"
                        ]

        return super().write(vals)
