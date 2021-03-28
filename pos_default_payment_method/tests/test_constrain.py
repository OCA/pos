# Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
# @author: Simone Orsi (https://twitter.com/simahawk)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo


@odoo.tests.common.at_install(False)
@odoo.tests.common.post_install(True)
class TestPOS(odoo.tests.TransactionCase):

    def test_check_default_payment_method_id(self):
        journal_ok = self.env['account.journal'].create({
            'name': 'Ok',
            'code': 'OK',
            'type': 'cash',
        })
        journal_ko = self.env['account.journal'].create({
            'name': 'Ko',
            'code': 'KO',
            'type': 'cash',
        })
        config = self.env.ref('point_of_sale.pos_config_main')
        config.write({'journal_ids': [(6, 0, journal_ok.ids)]})
        config.default_payment_method_id = journal_ok
        with self.assertRaises(odoo.exceptions.ValidationError):
            config.default_payment_method_id = journal_ko
