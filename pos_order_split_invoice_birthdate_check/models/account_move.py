# Copyright (C) 2014-2015  Grupo ESOC <www.grupoesoc.es>
# Copyright 2017-Apertoso N.V. (<http://www.apertoso.be>)
# Copyright 2019-2020: Druidoo (<https://www.druidoo.io>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountMove(models.Model):
    _name = "account.move"
    _inherit = "account.move"

    splitting_partner_birthdate = fields.Date(
        related="splitting_partner_id.birthdate_date",
        string="Splitting Partner Birthdate",
    )
