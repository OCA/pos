# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosPaymentChangeWizardOldLine(models.TransientModel):
    _name = "pos.payment.change.wizard.old.line"
    _description = "PoS Payment Change Wizard Old Line"

    wizard_id = fields.Many2one(
        comodel_name="pos.payment.change.wizard", required=True,
    )

    old_journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Journal",
        required=True,
        readonly=True,
    )

    amount = fields.Float(string="Amount", required=True, readonly=True)
