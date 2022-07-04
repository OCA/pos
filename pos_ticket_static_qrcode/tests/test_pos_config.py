# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import mock
import odoo
from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPointOfSaleOrderZipCode(TestPointOfSaleCommon):
    def setUp(self):
        super().setUp()
        self.pos_config.open_session_cb()
        self.pos_config.pos_ticket_static_qrcode_value = "https://odoo-community.org/"
        self.pos_config.pos_ticket_static_qrcode_message = "Visit OCA Website"

    def test_qrcode(self):
        # test last 40 chars base64 image results
        self.assertEqual(
            self.pos_config.pos_ticket_static_qrcode.decode()[-40:],
            "AUJFPvLO/pdXlC6+K3ZqZV4AAAAASUVORK5CYII=",
        )

    def test_failed_to_generate_qrcode(self):
        with mock.patch(
            "odoo.addons.pos_ticket_static_qrcode.models.pos_config.qrcode.QRCode",
            side_effect=Exception("TEST something goes wrong"),
        ):
            with self.assertRaisesRegex(ValueError, ".*TEST something goes wrong.*"):
                self.pos_config.pos_ticket_static_qrcode.decode()

    def test_no_value(self):
        self.pos_config.pos_ticket_static_qrcode_value = ""
        self.assertFalse(self.pos_config.pos_ticket_static_qrcode)
