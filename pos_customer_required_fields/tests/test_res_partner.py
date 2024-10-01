# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import odoo
from odoo.exceptions import ValidationError

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestCreateResPartnerFromPointOfSaleControledFields(TestPointOfSaleCommon):
    def setUp(self):
        super().setUp()
        self.pos_res_partner_payload = {
            "pos_config_id": str(
                self.pos_config.id
            ),  # frontend input type hidden send as text
            "barcode": False,
            "city": False,
            "country_id": "75",
            "email": False,
            "id": False,
            "is_company": False,
            "name": "Test Création",
            "phone": False,
            "property_product_pricelist": 1,
            "street": "1r",
            "vat": False,
            "zip": "66888",
        }
        self.ResPartner = self.env["res.partner"]
        self.ModelFields = self.env["ir.model.fields"]

    def test_create_from_ui(self):
        """
        Simulation of res.partner coming from the interface
        """
        self.pos_config.open_existing_session_cb()

        self.pos_config.res_partner_required_fields_ids = self.ModelFields.search(
            [("model", "=", "res.partner"), ("name", "in", ["street", "zip"])]
        )

        # I create an order on an open session
        partner = self.ResPartner.browse(
            self.ResPartner.create_from_ui(self.pos_res_partner_payload)
        )
        self.assertEqual(partner.street, "1r")
        self.assertEqual(partner.zip, "66888")

    def test_create_from_ui_missing_field(self):
        self.pos_config.open_existing_session_cb()

        self.pos_config.res_partner_required_fields_ids = self.ModelFields.search(
            [("model", "=", "res.partner"), ("name", "in", ["name", "zip"])]
        )

        self.pos_res_partner_payload["zip"] = False

        with self.assertRaisesRegex(
            ValidationError, r"Following required field\(s\) is/are not set: Zip"
        ):
            self.ResPartner.create_from_ui(self.pos_res_partner_payload)

    def test_update_existing_partner_missing_information(self):

        self.pos_config.open_existing_session_cb()
        self.ResPartner.create(
            {
                "name": "test",
                "zip": "22322",
            }
        )
        self.pos_config.res_partner_required_fields_ids = self.ModelFields.search(
            [("model", "=", "res.partner"), ("name", "in", ["phone", "zip"])]
        )

        self.pos_res_partner_payload["zip"] = False

        with self.assertRaisesRegex(
            ValidationError, r"Following required field\(s\) is/are not set: Phone, Zip"
        ):
            self.ResPartner.create_from_ui(self.pos_res_partner_payload)
