# -*- coding: utf-8 -*-
# © 2016 Serv. Tecnol. Avanzados - Pedro M. Baeza
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class AccountFiscalPositionTax(models.Model):
    _inherit = "account.fiscal.position.tax"

    company_id = fields.Many2one(
        related="position_id.company_id", string="Company")
