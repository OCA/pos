# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@tagged("post_install", "-at_install")
class PosSession(TestPointOfSaleCommon):
    def test_loader_params_res_partner(self):
        params = self.PosSession._loader_params_res_partner()
        fields = params["search_params"]["fields"]
        self.assertIn(
            "contact_address", fields, msg="'contact_address' must be contain in fields"
        )
        self.assertIn(
            "partner_latitude",
            fields,
            msg="'partner_latitude' must be contain in fields",
        )
        self.assertIn(
            "partner_longitude",
            fields,
            msg="'partner_longitude' must be contain in fields",
        )
