from odoo.exceptions import UserError, ValidationError
from odoo.tests import Form, SavepointCase

from .common import PosPricelistShowDiscountCommonSetup


class TestPosConfigDiscountPricelist(
    SavepointCase,
    PosPricelistShowDiscountCommonSetup,
):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        main_pricelist, discount_pricelist = cls.create_pricelists(cls.env)
        cls.main_pos_config = cls.config_pos(
            cls.env,
            main_pricelist,
            discount_pricelist,
        )
        cls.pricelist_model = cls.env["product.pricelist"]
        cls.company_model = cls.env["res.company"]
        cls.USD = cls.env.ref("base.USD")
        cls.main_company = cls.env.ref("base.main_company")

    def test_pos_discount_pricelist_no_change_while_open(self):
        self.main_pos_config.open_session_cb(check_coa=False)

        with self.assertRaises(UserError):
            self.main_pos_config.display_discount_from_pricelist = False
        with self.assertRaises(UserError):
            self.main_pos_config.discount_pricelist_id = False

    def test_pos_discount_pricelist_same_company(self):
        self.pricelist_no_company = self.pricelist_model.create(
            {"name": "Pricelist No Company", "currency_id": self.USD.id}
        )

        self.main_pos_config.discount_pricelist_id = self.pricelist_no_company

        self.pricelist_this_company = self.pricelist_model.create(
            {
                "name": "Pricelist This Company",
                "currency_id": self.USD.id,
                "company_id": self.main_company.id,
            }
        )

        self.main_pos_config.discount_pricelist_id = self.pricelist_this_company

        other_company = self.company_model.create({"name": "Other Company"})
        self.pricelist_other_company = self.pricelist_model.create(
            {
                "name": "Pricelist Other Company",
                "currency_id": self.USD.id,
                "company_id": other_company.id,
            }
        )

        with self.assertRaises(ValidationError):
            self.main_pos_config.discount_pricelist_id = self.pricelist_other_company

    def test_pos_discount_pricelist_onchange_use_pricelist(self):
        self.assertTrue(self.main_pos_config.display_discount_from_pricelist)
        self.assertTrue(self.main_pos_config.discount_pricelist_id)

        with Form(self.main_pos_config) as f:
            f.use_pricelist = False

        self.assertFalse(self.main_pos_config.display_discount_from_pricelist)
        self.assertFalse(self.main_pos_config.discount_pricelist_id)

    def test_pos_discount_pricelist_onchange_available_pricelists(self):
        self.assertTrue(self.main_pos_config.discount_pricelist_id)

        with Form(self.main_pos_config) as f:
            f.available_pricelist_ids.remove(
                id=self.main_pos_config.discount_pricelist_id.id
            )
            self.assertFalse(f.discount_pricelist_id)
            f.discount_pricelist_id = f.pricelist_id
