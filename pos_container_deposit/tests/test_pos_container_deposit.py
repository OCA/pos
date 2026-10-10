# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo.tests.common import TransactionCase


class TestPosDeposit(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.deposit_product = cls.env.ref("pos_container_deposit.demo_deposit_product")
        cls.product = cls.env.ref("pos_container_deposit.demo_product")
        cls.product_template = cls.product.product_tmpl_id

    def test_product_behavior(self):
        """
        Test that product search, write, copy behaves as expected with deposit products
        """
        self.assertIn(
            self.product,
            self.env["product.product"].search(
                [
                    ("deposit_product_id", "=", self.deposit_product.id),
                ]
            ),
        )
        self.assertIn(
            self.product_template,
            self.env["product.template"].search(
                [
                    ("deposit_product_id", "=", self.deposit_product.id),
                ]
            ),
        )
        self.product_template.deposit_product_id = False
        self.assertFalse(self.product.deposit_product_id)
        self.product.deposit_product_id = self.deposit_product
        self.assertEqual(self.product_template.deposit_product_id, self.deposit_product)
        product2 = self.product.copy({})
        self.assertEqual(product2.deposit_product_id, self.deposit_product)
        self.assertEqual(self.product_template.deposit_product_id, self.deposit_product)
        template2 = self.product_template.copy()
        self.assertEqual(template2.deposit_product_id, self.deposit_product)

    def test_pos_session(self):
        """
        Be sure the extra fields are loaded in the POS frontend
        """
        product_fields = self.env["product.product"]._load_pos_data_fields(False)
        self.assertIn("deposit_product_id", product_fields)
        self.assertIn("is_deposit", product_fields)

        line_fields = self.env["pos.order.line"]._load_pos_data_fields(False)
        self.assertIn("container_deposit_line_id", line_fields)
        self.assertIn("is_container_deposit", line_fields)

    def test_pos_data_domain_always_loads_deposit_products(self):
        """
        A deposit product must be loaded in the POS session even when it
        does not belong to any of the categories the session restricts
        browsing to.
        """
        pos_categ = self.env["pos.category"].create({"name": "Some Category"})
        self.product_template.pos_categ_ids = [(6, 0, [pos_categ.id])]
        self.deposit_product.product_tmpl_id.pos_categ_ids = [(5, 0, 0)]

        config = self.env["pos.config"].create(
            {
                "name": "Test Deposit Config",
                "limit_categories": True,
                "iface_available_categ_ids": [(6, 0, [pos_categ.id])],
            }
        )
        data = {"pos.config": {"data": [{"id": config.id}]}}
        domain = self.env["product.product"]._load_pos_data_domain(data)
        products = self.env["product.product"].search(domain)
        self.assertIn(self.deposit_product, products)

    def test_deposit_product_inherits_pos_categ_ids(self):
        """
        Setting a deposit product on a template should add that template's
        POS categories to the deposit product, without removing any
        category already set on it.
        """
        categ_a = self.env["pos.category"].create({"name": "Category A"})
        categ_b = self.env["pos.category"].create({"name": "Category B"})
        self.deposit_product.product_tmpl_id.pos_categ_ids = [(6, 0, [categ_b.id])]

        self.product_template.deposit_product_id = False
        self.product_template.pos_categ_ids = [(6, 0, [categ_a.id])]
        self.product_template.deposit_product_id = self.deposit_product

        deposit_categ_ids = self.deposit_product.product_tmpl_id.pos_categ_ids
        self.assertIn(categ_a, deposit_categ_ids)
        self.assertIn(categ_b, deposit_categ_ids)
