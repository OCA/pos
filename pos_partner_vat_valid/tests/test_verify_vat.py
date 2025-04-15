# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0

from odoo.tests.common import TransactionCase


class TestPOSPartnerVatValid(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Partner = cls.env["res.partner"]

    def test_vat_check_invalid(self):
        self.assertTrue(
            self.Partner.vat_check("ESA12345674", self.env.ref("base.es").id)
        )

    def test_vat_check_valid(self):
        self.assertFalse(
            self.Partner.vat_check("CHE123.456.788 MWST", self.env.ref("base.ch").id)
        )
