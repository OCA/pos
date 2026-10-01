# Copyright 2017 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from unittest.mock import MagicMock, patch

from odoo import Command
from odoo.exceptions import ValidationError

from odoo.addons.base.tests.common import BaseCommon
from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


class TestIdentificationCommonPos(TestPointOfSaleCommon, BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.id_number_model = cls.env["res.partner.id_number"]
        cls.ir_config = cls.env["ir.config_parameter"].sudo()
        ResPartnerIdCategory = cls.env["res.partner.id_category"]
        ResPartner = cls.env["res.partner"]
        ProductTemplate = cls.env["product.template"]
        cls.category_corrosive = ResPartnerIdCategory.create(
            {"code": "id_corrosive", "name": "Corrosive"}
        )
        cls.category_bilogical = ResPartnerIdCategory.create(
            {"code": "id_corrosive", "name": "Bilogical"}
        )
        cls.category_bio = ResPartnerIdCategory.create(
            {"code": "bio", "name": "Bio Certified"}
        )
        cls.partner_id = ResPartner.create(
            {
                "name": "Partner Categegory Corrosive",
                "company_type": "company",
                "vat": "VAT123",
                "id_numbers": [
                    Command.create(
                        {
                            "name": "Corrosive",
                            "category_id": cls.category_corrosive.id,
                        }
                    ),
                    Command.create(
                        {
                            "name": "Bio",
                            "category_id": cls.category_bio.id,
                        }
                    ),
                ],
            }
        )
        cls.partner_company_no_vat = ResPartner.create(
            {
                "name": "Partner Company No VAT",
                "company_type": "company",
                "vat": False,
            }
        )
        cls.product_tmpl_id = ProductTemplate.create(
            {
                "name": "Product Iden",
                "required_identification": True,
                "product_tmpl_category_ids": [
                    Command.create(
                        {
                            "category_id": cls.category_corrosive.id,
                            "is_mandatory": False,
                        }
                    ),
                    Command.create(
                        {
                            "category_id": cls.category_bilogical.id,
                            "is_mandatory": True,
                        }
                    ),
                ],
            }
        )
        cls.product_id = cls.product_tmpl_id.product_variant_ids[:1]
        cls.product_tmpl_opt_id = ProductTemplate.create(
            {
                "name": "Product Optional",
                "required_identification": True,
                "product_tmpl_category_ids": [
                    Command.create(
                        {
                            "category_id": cls.category_bilogical.id,
                            "is_mandatory": True,
                        }
                    )
                ],
            }
        )
        cls.product_opt_id = cls.product_tmpl_opt_id.product_variant_ids[:1]
        cls.product_tmpl_formula_partner_id = ProductTemplate.create(
            {
                "name": "Product Optional Formula Partner",
                "required_identification": True,
                "product_tmpl_category_ids": [
                    Command.create(
                        {
                            "category_id": cls.category_bio.id,
                            "is_mandatory": False,
                            "value": """
if order.partner_id.company_type == 'company':
    valid_bio_ids = order.partner_id.id_numbers.filtered(
        lambda l: l.category_id.code == 'bio'
        and (not l.valid_until or l.valid_until > datetime.datetime.now().date())
    )
    if order.partner_id.vat and len(valid_bio_ids) > 0:
        result = True
    else:
        result = False
else:
    result = True
""",
                        }
                    )
                ],
            }
        )
        cls.product_formula_partner_id = (
            cls.product_tmpl_formula_partner_id.product_variant_ids[:1]
        )
        cls.product_tmpl_formula_opt_id = ProductTemplate.create(
            {
                "name": "Product Optional Formula",
                "required_identification": True,
                "product_tmpl_category_ids": [
                    Command.create(
                        {
                            "category_id": cls.category_corrosive.id,
                            "is_mandatory": False,
                            "value": "result = False",
                        }
                    )
                ],
            }
        )
        cls.product_formula_opt_id = (
            cls.product_tmpl_formula_opt_id.product_variant_ids[:1]
        )

    def setUp(self):
        super().setUp()
        self.ir_config.set_param(
            "sale_product_identification_pos.enforce_partner_identification",
            "0",
        )

    def test_validate_identification_pos_no_params(self):
        result = self.id_number_model.validate_identification_pos()
        self.assertTrue(result)

    def test_validate_identification_pos_optional_warning(self):
        params = {
            "identification_ids": [self.category_corrosive.id],
            "product_ids": [self.product_id.id],
            "mandatory": False,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertIsInstance(result, dict)
        self.assertFalse(result["mandatory"])
        self.assertIn(self.product_tmpl_id.name, result["message"])
        self.assertIn(self.category_corrosive.name, result["message"])

    def test_validate_identification_pos_optional_formula_blocks(self):
        params = {
            "identification_ids": [self.category_corrosive.id],
            "product_ids": [self.product_formula_opt_id.id],
            "mandatory": False,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertIsInstance(result, dict)
        self.assertTrue(result["mandatory"])
        self.assertIn(self.product_tmpl_formula_opt_id.name, result["message"])

    def test_validate_identification_pos_optional_formula_with_partner(self):
        params = {
            "identification_ids": [self.category_bio.id],
            "partner_id": self.partner_id.id,
            "product_ids": [self.product_formula_partner_id.id],
            "mandatory": False,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertIsInstance(result, dict)
        self.assertFalse(result["mandatory"])
        self.assertIn(self.product_tmpl_formula_partner_id.name, result["message"])

        params["partner_id"] = self.partner_company_no_vat.id
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertTrue(result["mandatory"])
        self.assertIn(self.product_tmpl_formula_partner_id.name, result["message"])

    def test_validate_identification_pos_mandatory_with_partner(self):
        params = {
            "identification_ids": [self.category_bilogical.id],
            "partner_id": self.partner_id.id,
            "product_ids": [self.product_opt_id.id],
            "mandatory": True,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertIsInstance(result, dict)
        self.assertTrue(result["mandatory"])
        self.assertIn(self.product_tmpl_opt_id.name, result["message"])
        self.assertIn(self.category_bilogical.name, result["message"])

    def test_validate_identification_pos_enforced_without_partner(self):
        params = {
            "identification_ids": [self.category_bilogical.id],
            "partner_id": False,
            "product_ids": [self.product_opt_id.id],
            "mandatory": True,
            "enforce_partner_identification": True,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertTrue(result["mandatory"])
        self.assertIn(self.product_tmpl_opt_id.name, result["message"])

    def test_validate_identification_pos_uses_config_parameter(self):
        self.ir_config.set_param(
            "sale_product_identification_pos.enforce_partner_identification",
            "1",
        )
        params = {
            "identification_ids": [self.category_bilogical.id],
            "partner_id": False,
            "product_ids": [self.product_opt_id.id],
            "mandatory": True,
        }
        result = self.id_number_model.validate_identification_pos(**params)
        self.assertTrue(result["mandatory"])

    def test_validate_identification_pos_error_message_body(self):
        params = {
            "partner_id": self.partner_id.id,
            "mandatory": True,
        }
        error_message = "Error message body"
        fake_validate_identification = MagicMock(ids=[12])
        with (
            patch.object(
                type(self.id_number_model),
                "validate_identification",
                autospec=True,
                return_value=fake_validate_identification,
            ) as mock_validate_identification,
            patch.object(
                type(self.id_number_model),
                "message_error_identifications",
                autospec=True,
                side_effect=ValidationError(error_message),
            ) as mock_message_error_identifications,
        ):
            result = self.id_number_model.validate_identification_pos(**params)
            self.assertTrue(result["mandatory"])
            self.assertEqual(result["message"], error_message)
            mock_validate_identification.assert_called_once()
            mock_message_error_identifications.assert_called_once()

    def test_load_pos_data_fields(self):
        with patch(
            "odoo.addons.point_of_sale.models.pos_session.PosSession._load_pos_data_fields",
            autospec=True,
            return_value=[],
        ) as mock_load_pos_data_fields_super:
            result = self.PosSession._load_pos_data_fields(self.pos_config.id)
            self.assertIn("enforce_partner_identification", result)
            mock_load_pos_data_fields_super.assert_called_once()
