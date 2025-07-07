# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosFullRefund(TestPointOfSaleHttpCommon):
    """Test the Full Refund functionality in POS."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Remove taxes from products used in the tour (base setup adds
        # SRC 10% to letter_tray) so the test doesn't depend on tax
        # configuration details that may vary across environments.
        cls.letter_tray.taxes_id = False
        # Ensure Bank payment method is available in the config
        cls.main_pos_config.write(
            {"payment_method_ids": [(4, cls.bank_payment_method.id)]}
        )

    def test_pos_full_refund(self):
        """Test that clicking 'Do Full Refund' creates a refund order with all lines."""
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosFullRefundTour",
            login="pos_user",
        )
