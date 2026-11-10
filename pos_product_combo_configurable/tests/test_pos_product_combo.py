# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo.exceptions import UserError, ValidationError
from odoo.tests.common import TransactionCase


class TestPosProductCombo(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.PosCategory = cls.env["pos.category"]
        cls.ProductTemplate = cls.env["product.template"]
        cls.ProductProduct = cls.env["product.product"]
        cls.ProductComboPack = cls.env["product.combo.pack"]
        cls.PosConfig = cls.env["pos.config"]
        cls.PosSession = cls.env["pos.session"]
        cls.PosOrder = cls.env["pos.order"]

        cls.categ_drinks = cls.PosCategory.create({"name": "Drinks"})
        cls.categ_food = cls.PosCategory.create({"name": "Food"})

        cls.prod_cola = cls.ProductProduct.create(
            {
                "name": "Coca-Cola",
                "available_in_pos": True,
                "sale_ok": True,
                "list_price": 2.20,
                "pos_categ_id": cls.categ_drinks.id,
                "detailed_type": "consu",
            }
        )
        cls.prod_water = cls.ProductProduct.create(
            {
                "name": "Water",
                "available_in_pos": True,
                "sale_ok": True,
                "list_price": 2.20,
                "pos_categ_id": cls.categ_drinks.id,
                "detailed_type": "consu",
            }
        )
        cls.prod_pasta = cls.ProductProduct.create(
            {
                "name": "Pasta 4 formaggi",
                "available_in_pos": True,
                "sale_ok": True,
                "list_price": 5.50,
                "pos_categ_id": cls.categ_food.id,
                "detailed_type": "consu",
            }
        )

        cls.combo_burger_tmpl = cls.ProductTemplate.create(
            {
                "name": "Bacon Burger Combo",
                "is_combo": True,
                "available_in_pos": True,
                "sale_ok": True,
                "list_price": 7.50,
                "pos_categ_id": cls.categ_food.id,
                "detailed_type": "consu",
                "combo_pack_ids": [
                    (
                        0,
                        0,
                        {
                            "is_required": False,
                            "include_price": False,
                            "include_all_products": True,
                            "pos_category_id": cls.categ_drinks.id,
                            "product_ids": [
                                (6, 0, [cls.prod_cola.id, cls.prod_water.id])
                            ],
                            "default_qty": 2,
                            "no_of_items": 2,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "is_required": False,
                            "include_price": True,
                            "include_all_products": False,
                            "pos_category_id": cls.categ_food.id,
                            "product_ids": [(6, 0, [cls.prod_pasta.id])],
                            "default_qty": 1,
                            "no_of_items": 1,
                        },
                    ),
                ],
            }
        )

    def test_01_duplicate_unrequired_category_constraint(self):
        with self.assertRaises(UserError):
            self.combo_burger_tmpl.write(
                {
                    "combo_pack_ids": [
                        (
                            0,
                            0,
                            {
                                "is_required": False,
                                "include_price": False,
                                "pos_category_id": self.categ_drinks.id,
                                "product_ids": [(6, 0, [self.prod_cola.id])],
                                "default_qty": 1,
                                "no_of_items": 1,
                            },
                        )
                    ]
                }
            )

    def test_02_invalid_quantities_constraint(self):
        with self.assertRaises(ValidationError):
            self.ProductComboPack.create(
                {
                    "product_tmpl_id": self.combo_burger_tmpl.id,
                    "is_required": True,
                    "pos_category_id": self.categ_drinks.id,
                    "product_ids": [(6, 0, [self.prod_cola.id])],
                    "default_qty": 0,
                    "no_of_items": 1,
                }
            )

    def test_03_onchange_include_all_products(self):
        pack_line = self.ProductComboPack.new(
            {
                "product_tmpl_id": self.combo_burger_tmpl.id,
                "pos_category_id": self.categ_drinks.id,
                "include_all_products": True,
            }
        )
        pack_line._onchange_pos_category_include_all()
        self.assertIn(self.prod_cola, pack_line.product_ids._origin)
        self.assertIn(self.prod_water, pack_line.product_ids._origin)
        pack_line.include_all_products = False
        pack_line._onchange_pos_category_include_all()
        self.assertIn(self.prod_cola, pack_line.product_ids._origin)
        pack_line.pos_category_id = False
        pack_line._onchange_pos_category_include_all()
        self.assertFalse(pack_line.product_ids)

    def test_04_pos_order_fields_expands_combo_sublines(self):
        pos_config = self.PosConfig.create({"name": "Test Combo Shop"})
        pos_session = self.PosSession.create({"config_id": pos_config.id})
        combo_product = self.combo_burger_tmpl.product_variant_id

        loader_params = pos_session._loader_params_product_product()
        loaded_fields = loader_params["search_params"]["fields"]
        self.assertIn("is_combo", loaded_fields)
        self.assertIn("combo_pack_ids", loaded_fields)
        combo_packs = pos_session._get_pos_ui_product_combo_pack(
            pos_session._loader_params_product_combo_pack()
        )
        self.assertTrue(combo_packs)

        ui_order = {
            "user_id": self.env.uid,
            "pos_session_id": pos_session.id,
            "name": "Order 0001",
            "sequence_number": 1,
            "partner_id": False,
            "creation_date": "2026-10-24T10:00:00",
            "fiscal_position_id": False,
            "pricelist_id": pos_config.pricelist_id.id,
            "amount_paid": 16.30,
            "amount_total": 16.30,
            "amount_tax": 0.0,
            "amount_return": 0.0,
            "to_invoice": False,
            "to_ship": False,
            "has_picking_delayed": False,
            "lines": [
                [
                    0,
                    0,
                    {
                        "product_id": combo_product.id,
                        "full_product_name": combo_product.display_name,
                        "qty": 1.0,
                        "price_unit": 16.30,
                        "price_subtotal": 16.30,
                        "price_subtotal_incl": 16.30,
                        "discount": 0.0,
                        "tax_ids": [[6, False, []]],
                        "combo_prod_info": [
                            {
                                "product_id": self.prod_cola.id,
                                "product_name": self.prod_cola.display_name,
                                "qty": 2,
                                "price": 2.20,
                                "include_price": False,
                                "is_required": False,
                            },
                            {
                                "product_id": self.prod_water.id,
                                "product_name": self.prod_water.display_name,
                                "qty": 2,
                                "price": 2.20,
                                "include_price": False,
                                "is_required": False,
                            },
                            {
                                "product_id": self.prod_pasta.id,
                                "product_name": self.prod_pasta.display_name,
                                "qty": 2,
                                "price": 5.50,
                                "include_price": True,
                                "is_required": False,
                            },
                        ],
                    },
                ]
            ],
        }
        order_vals = self.PosOrder._order_fields(ui_order)
        self.assertEqual(len(order_vals["lines"]), 4)
        main_line = order_vals["lines"][0][2]
        self.assertEqual(main_line["product_id"], combo_product.id)
        self.assertEqual(main_line["price_unit"], 16.30)
        self.assertFalse(main_line.get("is_combo_subline"))

        sub_line_1 = order_vals["lines"][1][2]
        self.assertEqual(sub_line_1["product_id"], self.prod_cola.id)
        self.assertEqual(sub_line_1["qty"], 2.0)
        self.assertEqual(sub_line_1["price_unit"], 0.0)
        self.assertTrue(sub_line_1["is_combo_subline"])
