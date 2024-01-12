# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import Form, TransactionCase


class TestModule(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env.user.groups_id += cls.env.ref("uom.group_uom")
        cls.uom_unit = cls.env.ref("uom.product_uom_unit")
        cls.uom_kg = cls.env.ref("uom.product_uom_kgm")

    def test_product_product_onchange(self):
        self._test_model_onchange("product.product")

    def test_product_template_onchange(self):
        self._test_model_onchange("product.template")

    def test_product_product_create(self):
        self._test_create("product.product")

    def test_product_template_create(self):
        self._test_create("product.template")

    def test_product_product_write(self):
        self._test_write("product.product")

    def test_product_template_write(self):
        self._test_write("product.template")

    def _test_model_onchange(self, model_name):
        item_form = Form(self.env[model_name])
        item_form.uom_id = self.uom_unit

        self.assertEqual(item_form.to_weight, False)
        item_form.uom_id = self.uom_kg
        self.assertEqual(item_form.to_weight, True)

    def _test_create(self, model_name):

        # Test with uom Unit and NO 'To weight' Value
        item = self.env[model_name].create(
            {
                "name": "Demo Product",
                "uom_id": self.uom_unit.id,
            }
        )
        self.assertEqual(item.to_weight, False)

        # Test with uom Unit and 'To weight' Value
        item = self.env[model_name].create(
            {
                "name": "Demo Product",
                "uom_id": self.uom_unit.id,
                "to_weight": True,
            }
        )
        self.assertEqual(item.to_weight, True)

        # Test with uom to weight and NO 'To weight' Value
        item = self.env[model_name].create(
            {
                "name": "Demo Product",
                "uom_id": self.uom_kg.id,
                "uom_po_id": self.uom_kg.id,
            }
        )
        self.assertEqual(item.to_weight, True)

        # Test with uom to weight and NO 'To weight' Value
        item = self.env[model_name].create(
            {
                "name": "Demo Product",
                "uom_id": self.uom_kg.id,
                "uom_po_id": self.uom_kg.id,
                "to_weight": False,
            }
        )
        self.assertEqual(item.to_weight, False)

    def _test_write(self, model_name):
        item = self.env[model_name].create(
            {
                "name": "Demo Product",
                "uom_id": self.uom_unit.id,
            }
        )
        self.assertEqual(item.to_weight, False)
        item.write(
            {
                "uom_id": self.uom_kg.id,
                "uom_po_id": self.uom_kg.id,
            }
        )
        self.assertEqual(item.to_weight, True)
