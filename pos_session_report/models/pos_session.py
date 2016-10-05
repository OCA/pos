# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
# Hendrix Costa <hendrix.costa@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class PosSession(models.Model):
    _inherit = 'pos.session'

    user_id = fields.Many2one('res.users',
                              default=lambda self: self.env.user,
                              string='User')
