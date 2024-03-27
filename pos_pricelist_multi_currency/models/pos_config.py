from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosOrder(models.Model):
    _inherit = "pos.order"

    # remove relation to config:
    currency_id = fields.Many2one("res.currency", related=False, string="Currency")

    @api.model
    def create(self, values):
        if values.get("currency_id"):
            pass
        elif values.get("pricelist_id"):
            pricelist = self.env["product.pricelist"].browse(values["pricelist_id"])
            values["currency_id"] = pricelist.currency_id.id
        elif values.get("session_id"):
            session = self.env["pos.session"].browse(values["session_id"])
            values["currency_id"] = session.config_id.currency_id.id
        res = super(PosOrder, self).create(values)
        return res


class PosConfig(models.Model):
    _inherit = "pos.config"

    @api.constrains(
        "pricelist_id",
        "use_pricelist",
        "available_pricelist_ids",
        "journal_id",
        "invoice_journal_id",
        "payment_method_ids",
    )
    def _check_currencies(self):
        try:
            super()._check_currencies()
        except ValidationError as err:
            msg_to_catch = _(
                "All available pricelists must be in the same currency as the company or"
                " as the Sales Journal set on this point of sale if you use"
                " the Accounting application."
            )
            if err.args[0] != msg_to_catch:
                raise
