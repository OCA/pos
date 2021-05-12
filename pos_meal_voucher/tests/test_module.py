# Copyright 2021 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):

    def setUp(self):
        super().setUp()
        self.ProductProduct = self.env['product.product']
        self.ProductTemplate = self.env['product.template']
        self.food_category = self.env.ref("pos_meal_voucher.food_category")
        self.main_category = self.env.ref("product.product_category_all")
        self.uom_unit = self.env.ref("uom.product_uom_unit")

    def test_product_product(self):
        product = self.ProductProduct.create({
            "name": "Product",
            "uom_id": self.uom_unit.id,
            "uom_po_id": self.uom_unit.id,
            "categ_id": self.food_category.id,
        })
        self.assertEqual(product.meal_voucher_ok, True)

        # Affect product to a non-food category and run onchange
        product.categ_id = self.main_category.id
        product.onchange_categ_id_pos_meal_voucher()
        self.assertEqual(product.meal_voucher_ok, False)

    def test_product_template(self):
        template = self.ProductTemplate.create({
            "name": "Product",
            "uom_id": self.uom_unit.id,
            "uom_po_id": self.uom_unit.id,
            "categ_id": self.food_category.id,
        })
        self.assertEqual(template.meal_voucher_ok, True)

        # Affect template to a non-food category and run onchange
        template.categ_id = self.main_category.id
        template.onchange_categ_id_pos_meal_voucher()
        self.assertEqual(template.meal_voucher_ok, False)

        # Set non-food category as a food category and propagate settings
        # to all the child product
        self.main_category.meal_voucher_ok = True
        self.main_category.button_apply_meal_voucher_settings()
        self.assertEqual(template.meal_voucher_ok, True)
